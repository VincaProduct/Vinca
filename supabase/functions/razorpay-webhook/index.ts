import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { verifyWebhookSignature, getRazorpayCredentials } from '../_shared/razorpay.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('x-razorpay-signature');
    const eventId = req.headers.get('x-razorpay-event-id');
    
    if (!signature) {
      console.error('No signature in webhook');
      return new Response(
        JSON.stringify({ error: 'No signature provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rawBody = await req.text();
    const credentials = getRazorpayCredentials();

    const isValid = verifyWebhookSignature(rawBody, signature, credentials.webhookSecret);

    if (!isValid) {
      console.error('Invalid webhook signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Webhook signature verified');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check for duplicate webhook
    if (eventId) {
      const { data: existingLog } = await supabaseClient
        .from('payment_transactions')
        .select('id')
        .eq('webhook_event_id', eventId)
        .maybeSingle();

      if (existingLog) {
        console.log('Webhook already processed:', eventId);
        return new Response(
          JSON.stringify({ status: 'already_processed' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const event = JSON.parse(rawBody);
    console.log('Processing webhook event:', event.event, event.payload?.payment?.entity?.id);

    const payload = event.payload;
    const eventType = event.event;

    // Get order and user info
    const orderId = payload.payment?.entity?.order_id || payload.order?.entity?.id;
    
    if (!orderId) {
      console.error('No order ID in webhook payload');
      return new Response(
        JSON.stringify({ error: 'No order ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: order } = await supabaseClient
      .from('razorpay_orders')
      .select('*')
      .eq('razorpay_order_id', orderId)
      .single();

    if (!order) {
      console.error('Order not found:', orderId);
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process different event types
    switch (eventType) {
      case 'payment.authorized':
        console.log('Payment authorized:', payload.payment.entity.id);
        await supabaseClient
          .from('razorpay_orders')
          .update({ status: 'authorized' })
          .eq('id', order.id);
        break;

      case 'payment.captured':
        console.log('Payment captured:', payload.payment.entity.id);
        
        const { data: existingPayment } = await supabaseClient
          .from('razorpay_payments')
          .select('id')
          .eq('razorpay_payment_id', payload.payment.entity.id)
          .maybeSingle();

        if (!existingPayment) {
          const { data: payment } = await supabaseClient
            .from('razorpay_payments')
            .insert({
              order_id: order.id,
              user_id: order.user_id,
              razorpay_payment_id: payload.payment.entity.id,
              razorpay_order_id: orderId,
              razorpay_signature: 'webhook',
              amount: payload.payment.entity.amount,
              currency: payload.payment.entity.currency,
              method: payload.payment.entity.method,
              status: 'captured',
              email: payload.payment.entity.email,
              contact: payload.payment.entity.contact,
              captured_at: new Date().toISOString()
            })
            .select()
            .single();

          await supabaseClient
            .from('user_memberships')
            .upsert({
              user_id: order.user_id,
              tier: 'premium',
              upgraded_at: new Date().toISOString(),
              payment_id: payment.id,
              razorpay_order_id: orderId,
              payment_date: new Date().toISOString()
            }, {
              onConflict: 'user_id'
            });

          // BACKGROUND TASK: Update Zoho Contact User_Type to Pro (non-blocking)
          const updateZohoContactUserType = async () => {
            try {
              console.log('Triggering Zoho Contact User_Type update for user:', order.user_id);
              
              const response = await fetch(
                `${Deno.env.get('SUPABASE_URL')}/functions/v1/update-zoho-contact-user-type`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
                  },
                  body: JSON.stringify({
                    userId: order.user_id,
                    planAmount: order.amount,
                    planName: order.plan_type || 'Premium Pro',
                  }),
                }
              );

              const result = await response.json();
              
              if (result.success) {
                console.log('Zoho Contact User_Type update successful:', result);
              } else {
                console.warn('Zoho Contact User_Type update failed (non-critical):', result.error);
              }
            } catch (error) {
              // Log but don't throw - Zoho update failure shouldn't affect payment flow
              console.error('Zoho Contact update error (non-critical):', error);
            }
          };

          // Start update in background without blocking webhook response
          updateZohoContactUserType().catch(err => 
            console.error('Background Zoho Contact update task failed:', err)
          );
        }

        await supabaseClient
          .from('razorpay_orders')
          .update({ status: 'paid' })
          .eq('id', order.id);
        break;

      case 'payment.failed':
        console.log('Payment failed:', payload.payment.entity.id);
        await supabaseClient
          .from('razorpay_orders')
          .update({ status: 'failed' })
          .eq('id', order.id);
        break;

      case 'order.paid':
        console.log('Order paid:', orderId);
        await supabaseClient
          .from('razorpay_orders')
          .update({ status: 'paid' })
          .eq('id', order.id);
        break;
    }

    // Log the webhook event
    await supabaseClient
      .from('payment_transactions')
      .insert({
        user_id: order.user_id,
        order_id: order.id,
        event_type: eventType,
        event_data: payload,
        webhook_event_id: eventId || null
      });

    console.log('Webhook processed successfully');

    return new Response(
      JSON.stringify({ status: 'success' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
