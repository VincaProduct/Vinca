import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    // Verify shared secret to ensure request is from Zoho
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    const expectedToken = Deno.env.get('ZOHO_WEBHOOK_SECRET');

    if (!expectedToken || token !== expectedToken) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json();
    console.log('Zoho webhook received:', JSON.stringify(body));

    // Zoho CRM webhook payload — handle both array and object formats
    const contacts: any[] = Array.isArray(body.data) ? body.data : (body.data ? [body.data] : [body]);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const results = [];

    for (const contact of contacts) {
      const zohoContactId = contact.id || contact.ID;
      const email         = contact.Email;
      const firstName     = contact.First_Name;
      const lastName      = contact.Last_Name;
      const fullName      = contact.Full_Name || [firstName, lastName].filter(Boolean).join(' ');
      const phone         = contact.Phone;

      if (!zohoContactId && !email) {
        console.warn('Skipping contact with no id or email');
        continue;
      }

      // Build profile update — only include fields that Zoho sent
      const profileUpdate: Record<string, any> = {
        zoho_updated_at: new Date().toISOString(), // marks this as a Zoho-initiated change
      };

      if (firstName !== undefined) profileUpdate['first_name'] = firstName;
      if (lastName  !== undefined) profileUpdate['last_name']  = lastName;
      if (fullName  !== undefined) profileUpdate['full_name']  = fullName;
      if (phone     !== undefined) profileUpdate['phone']      = phone;

      // Map any extra Zoho fields that have matching columns in profiles
      // Add more mappings here as you add onboarding fields
      // e.g. if (contact.City !== undefined) profileUpdate['city'] = contact.City;

      let query = supabase.from('profiles').update(profileUpdate);

      // Match by zoho_contact_id first, fall back to email
      if (zohoContactId) {
        query = query.eq('zoho_contact_id', zohoContactId);
      } else {
        query = query.eq('email', email);
      }

      const { error, count } = await query.select('id', { count: 'exact', head: true });

      if (error) {
        console.error('Profile update error:', error);
        results.push({ zohoContactId, error: error.message });
      } else {
        console.log(`Updated ${count} profile(s) for Zoho contact ${zohoContactId}`);
        results.push({ zohoContactId, updated: count });
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('zoho-crm-webhook error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
