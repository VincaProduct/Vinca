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
    const url = new URL(req.url);

    // Verify shared secret
    const token         = url.searchParams.get('token');
    const expectedToken = Deno.env.get('ZOHO_WEBHOOK_SECRET');
    if (!expectedToken || token !== expectedToken) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Zoho sends all fields as Module Parameters (query params) — no API call needed
    const contactId = url.searchParams.get('contact_id');
    const firstName = url.searchParams.get('first_name');
    const lastName  = url.searchParams.get('last_name');
    const phone     = url.searchParams.get('phone');
    const email     = url.searchParams.get('email');
    const fullName  = [firstName, lastName].filter(Boolean).join(' ') || null;

    if (!contactId) {
      return new Response(JSON.stringify({ error: 'Missing contact_id' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Zoho webhook fired for contact:', contactId, { firstName, lastName, phone, email });

    // Build Supabase profile update
    const profileUpdate: Record<string, any> = {
      zoho_updated_at: new Date().toISOString(), // prevents Supabase→Zoho loop
    };

    if (firstName) profileUpdate['first_name'] = firstName;
    if (lastName)  profileUpdate['last_name']  = lastName;
    if (fullName)  profileUpdate['full_name']  = fullName;
    if (phone)     profileUpdate['phone']      = phone;

    // Add more field mappings here as you add onboarding fields:
    // if (contact.City) profileUpdate['city'] = contact.City;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Match by zoho_contact_id first, fall back to email
    const { error } = await supabase
      .from('profiles')
      .update(profileUpdate)
      .eq('zoho_contact_id', contactId);

    if (error) {
      console.error('Profile update error:', error);
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Profile updated for Zoho contact ${contactId}`);

    return new Response(
      JSON.stringify({ success: true, contactId }),
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
