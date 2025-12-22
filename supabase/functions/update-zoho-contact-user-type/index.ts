import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { zohoRequest } from '../_shared/zoho.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpdateUserTypeRequest {
  userId: string;
  planAmount: number;
  planName: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, planAmount, planName }: UpdateUserTypeRequest = await req.json();

    console.log('Updating Zoho Contact User_Type to Pro for user:', userId, 'Plan:', planName);

    // Get user's profile with zoho_contact_id
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id, email, first_name, last_name, zoho_contact_id, referral_code, zoho_referrer_contact_id')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('Profile not found:', profileError);
      throw new Error('User profile not found');
    }

    // Generate referral code for new premium user (if not exists)
    let userReferralCode = profile.referral_code;

    if (!userReferralCode) {
      // Generate code from first 8 chars of user UUID (uppercase)
      userReferralCode = userId.replace(/-/g, '').substring(0, 8).toUpperCase();
      
      console.log('Generated referral code for user:', userReferralCode);
      
      // Update profile with referral code
      await supabaseClient
        .from('profiles')
        .update({ referral_code: userReferralCode })
        .eq('id', userId);
    }

    // Check if zoho_contact_id exists
    if (!profile.zoho_contact_id) {
      console.error('No Zoho Contact ID found for user:', userId);
      throw new Error('No Zoho Contact ID found - contact may not have been created yet');
    }

    // Update Contact's User_Type field to "Pro"
    const updatePayload = {
      data: [{
        id: profile.zoho_contact_id,
        User_Type: 'Pro'
      }]
    };

    console.log('Updating Zoho Contact User_Type:', updatePayload);

    const updateResponse = await zohoRequest('PATCH', 'Contacts', updatePayload);

    console.log('Zoho update response:', JSON.stringify(updateResponse));

    if (updateResponse.data && updateResponse.data[0]?.code === 'SUCCESS') {
      console.log('Successfully updated Contact User_Type to Pro');

      // Optionally create a Deal for revenue tracking
      const closingDate = new Date().toISOString().split('T')[0];
      const dealName = `${profile.first_name || ''} ${profile.last_name || ''} - ${planName}`.trim();

      const dealPayload = {
        data: [{
          Deal_Name: dealName,
          Closing_Date: closingDate,
          Stage: 'Closed Won',
          Amount: planAmount / 100, // Convert paise to rupees
          Contact_Name: { id: profile.zoho_contact_id }
        }]
      };

      console.log('Creating Deal for revenue tracking:', dealPayload);

      const dealResponse = await zohoRequest('POST', 'Deals', dealPayload);

      let dealId = null;
      if (dealResponse.data && dealResponse.data[0]?.code === 'SUCCESS') {
        dealId = dealResponse.data[0].details.id;
        console.log('Deal created successfully:', dealId);

        // Update profile with deal ID
        await supabaseClient
          .from('profiles')
          .update({ zoho_deal_id: dealId })
          .eq('id', userId);
      } else {
        console.warn('Failed to create deal (non-critical):', dealResponse);
      }

      // Update referral tracking status to 'converted'
      await supabaseClient
        .from('user_referrals')
        .update({ status: 'converted' })
        .eq('user_id', userId);

      return new Response(
        JSON.stringify({
          success: true,
          contactId: profile.zoho_contact_id,
          dealId,
          userType: 'Pro'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      const errorMessage = updateResponse.data?.[0]?.message || 'Failed to update Contact in Zoho';
      console.error('Zoho update failed:', errorMessage);
      throw new Error(errorMessage);
    }

  } catch (error) {
    console.error('Error updating Zoho Contact User_Type:', error);

    // Try to log failure to database
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const requestBody = await req.json().catch(() => ({}));
      const { userId, planAmount, planName } = requestBody as UpdateUserTypeRequest;

      if (userId) {
        // Get zoho_contact_id for logging
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('zoho_contact_id')
          .eq('id', userId)
          .single();

        await supabaseClient
          .from('zoho_conversion_failures')
          .insert({
            user_id: userId,
            zoho_lead_id: profile?.zoho_contact_id || 'unknown', // Reusing field for contact ID
            error_message: error instanceof Error ? error.message : 'Unknown error',
            error_details: { 
              error: String(error),
              stack: error instanceof Error ? error.stack : undefined,
              operation: 'update_user_type_to_pro'
            },
            plan_type: planName || 'Premium Pro',
            plan_amount: planAmount || 25000,
          });
      }
    } catch (logError) {
      console.error('Failed to log update failure:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Update failed',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
