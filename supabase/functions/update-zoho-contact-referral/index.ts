import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { zohoRequest } from '../_shared/zoho.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpdateContactReferralRequest {
  zohoContactId: string;
  referralContactId: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Update Zoho Contact Referral Request Started ===');

    const { zohoContactId, referralContactId }: UpdateContactReferralRequest = await req.json();

    console.log('Request body:', { zohoContactId, referralContactId });

    if (!zohoContactId || !referralContactId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: zohoContactId or referralContactId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update contact with referral information
    const updatePayload = {
      data: [
        {
          id: zohoContactId,
          Lead_Source: 'External Referral',
          Referral_Contact: { id: referralContactId },
        },
      ],
    };

    console.log('Updating Zoho contact with referral:', updatePayload);

    const zohoResponse = await zohoRequest('PATCH', 'Contacts', updatePayload);

    console.log('Zoho API response:', JSON.stringify(zohoResponse, null, 2));

    if (zohoResponse.data && zohoResponse.data[0]?.code === 'SUCCESS') {
      console.log('Contact updated successfully with referral info');

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Contact updated with referral information',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.error('Failed to update contact:', zohoResponse);
      
      return new Response(
        JSON.stringify({
          error: 'Failed to update contact in Zoho',
          details: zohoResponse,
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error updating contact referral:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.toString() : String(error),
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
