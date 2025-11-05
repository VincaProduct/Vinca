import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { zohoRequest } from '../_shared/zoho.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpdateLeadReferralRequest {
  zohoLeadId: string;
  referralContactId: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Update Zoho Lead Referral Request Started ===');

    const { zohoLeadId, referralContactId }: UpdateLeadReferralRequest = await req.json();

    console.log('Request body:', { zohoLeadId, referralContactId });

    if (!zohoLeadId || !referralContactId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: zohoLeadId or referralContactId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update lead with referral information
    const updatePayload = {
      data: [
        {
          id: zohoLeadId,
          Lead_Source: 'External Referral',
          Referral_Contact: referralContactId,
        },
      ],
    };

    console.log('Updating Zoho lead with referral:', updatePayload);

    const zohoResponse = await zohoRequest('PATCH', 'Leads', updatePayload);

    console.log('Zoho API response:', JSON.stringify(zohoResponse, null, 2));

    if (zohoResponse.data && zohoResponse.data[0]?.code === 'SUCCESS') {
      console.log('Lead updated successfully with referral info');

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Lead updated with referral information',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.error('Failed to update lead:', zohoResponse);
      
      return new Response(
        JSON.stringify({
          error: 'Failed to update lead in Zoho',
          details: zohoResponse,
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error updating lead referral:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.toString() : String(error),
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
