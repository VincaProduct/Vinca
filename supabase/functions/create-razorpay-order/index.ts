import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { createRazorpayOrder } from '../_shared/razorpay.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderRequest {
  plan_type: string;
  amount: number;
  notes?: Record<string, string>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { plan_type, amount, notes = {} }: OrderRequest = await req.json();

    // SECURITY: Validate plan type and enforce server-side amount
    const validPlans: Record<string, number> = {
      'pro_lifetime': 2500000  // ₹25,000 in paise
    };

    if (!validPlans[plan_type]) {
      console.error('Invalid plan type:', plan_type);
      return new Response(
        JSON.stringify({ error: 'Invalid plan type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SECURITY: Enforce server-side amount - ignore client amount
    const serverAmount = validPlans[plan_type];
    
    if (amount !== serverAmount) {
      console.warn('Amount mismatch - using server amount:', { client: amount, server: serverAmount });
    }

    // Check if user already has premium membership
    const { data: membership } = await supabaseClient
      .from('user_memberships')
      .select('tier')
      .eq('user_id', user.id)
      .maybeSingle();

    if (membership && ['premium', 'client'].includes(membership.tier)) {
      return new Response(
        JSON.stringify({ error: 'User already has premium access' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SECURITY: Rate limiting - check for recent orders
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: recentOrders } = await supabaseClient
      .from('razorpay_orders')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', fiveMinutesAgo);

    if (recentOrders && recentOrders.length >= 3) {
      console.warn('Rate limit exceeded for user:', user.id);
      return new Response(
        JSON.stringify({ error: 'Too many payment attempts. Please wait 5 minutes.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Razorpay receipt must be max 40 chars, so use last 12 chars of user_id + timestamp
    const shortUserId = user.id.slice(-12);
    const receipt = `rcpt_${shortUserId}_${Date.now()}`;
    
    const orderNotes = {
      ...notes,
      user_id: user.id,
      plan_type,
      user_email: user.email || ''
    };

    console.log('Creating Razorpay order:', { amount: serverAmount, plan_type, user_id: user.id });

    const razorpayOrder = await createRazorpayOrder(
      serverAmount,
      'INR',
      receipt,
      orderNotes
    );

    console.log('Razorpay order created:', razorpayOrder.id);

    const { data: dbOrder, error: dbError } = await supabaseClient
      .from('razorpay_orders')
      .insert({
        user_id: user.id,
        razorpay_order_id: razorpayOrder.id,
        amount: serverAmount,
        currency: 'INR',
        receipt,
        status: 'created',
        plan_type,
        notes: orderNotes
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      throw dbError;
    }

    await supabaseClient
      .from('payment_transactions')
      .insert({
        user_id: user.id,
        order_id: dbOrder.id,
        event_type: 'order_created',
        event_data: { razorpay_order: razorpayOrder }
      });

    console.log('Order stored in database:', dbOrder.id);

    return new Response(
      JSON.stringify({
        success: true,
        order: {
          razorpay_order_id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          receipt: razorpayOrder.receipt
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error creating order:', error);
    
    // SECURITY: Don't expose internal error details to client
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create order',
        message: 'An error occurred while processing your request. Please try again or contact support.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
