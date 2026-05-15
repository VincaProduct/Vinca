import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { zohoRequest } from "../_shared/zoho.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const payload = await req.json();
    const { zoho_contact_id, first_name, last_name, full_name, phone, email, lead_source, ...extraFields } = payload;

    if (!zoho_contact_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing zoho_contact_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build Zoho contact update payload from whatever fields were passed
    const contactData: Record<string, any> = {};

    if (first_name !== undefined) contactData['First_Name'] = first_name;
    if (last_name  !== undefined) contactData['Last_Name']  = last_name;
    if (full_name  !== undefined) contactData['Full_Name']  = full_name;
    if (phone      !== undefined) contactData['Phone']      = phone;
    if (email      !== undefined) contactData['Email']      = email;
    if (lead_source !== undefined) contactData['Lead_Source'] = lead_source;

    // Any additional fields passed through (onboarding fields added later)
    for (const [key, value] of Object.entries(extraFields)) {
      if (value !== undefined && !key.startsWith('_')) {
        contactData[key] = value;
      }
    }

    if (Object.keys(contactData).length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No fields to update' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Updating Zoho contact ${zoho_contact_id}:`, JSON.stringify(contactData));

    const response = await zohoRequest('PUT', `Contacts/${zoho_contact_id}`, { data: [contactData] });

    console.log('Zoho update response:', JSON.stringify(response));

    return new Response(
      JSON.stringify({ success: true, data: response }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('sync-to-zoho error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
