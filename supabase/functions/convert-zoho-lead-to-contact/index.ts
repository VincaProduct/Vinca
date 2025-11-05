import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { zohoRequest } from '../_shared/zoho.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConversionRequest {
  userId: string;
  planAmount: number;
  planName: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use service role for internal operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, planAmount, planName }: ConversionRequest = await req.json();

    console.log('Converting Zoho lead for user:', userId, 'Plan:', planName);

    // Get user's profile with zoho_lead_id
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id, email, first_name, last_name, zoho_lead_id, zoho_contact_id, referral_code, zoho_referrer_contact_id')
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

    // Check if zoho_lead_id exists - if not, create contact directly
    if (!profile.zoho_lead_id) {
      console.warn('No Zoho Lead ID found for user - creating contact directly', userId);
      
      // Create contact directly in Zoho
      const contactData = {
        data: [{
          First_Name: profile.first_name || '',
          Last_Name: profile.last_name || 'Customer',
          Email: profile.email,
          Contact_Status: 'Active',
          Lead_Source: profile.zoho_referrer_contact_id ? 'External Referral' : 'Google Signup',
          Description: `Premium user - ${planName} (₹${planAmount / 100})`,
          ...(profile.zoho_referrer_contact_id && { 
            Referral_Contact: profile.zoho_referrer_contact_id
          })
        }]
      };

      console.log('Creating contact directly in Zoho CRM');
      
      const contactResponse = await zohoRequest('POST', 'Contacts', contactData);

      const contactResult = contactResponse.data?.[0];
      
      if (contactResult?.code === 'SUCCESS') {
        const newContactId = contactResult.details.id;
        console.log('Successfully created contact:', newContactId);

        // Update profile with contact ID
        await supabaseClient
          .from('profiles')
          .update({
            zoho_contact_id: newContactId,
          })
          .eq('id', userId);

        // Update referral tracking status to 'converted'
        await supabaseClient
          .from('user_referrals')
          .update({ 
            status: 'converted',
            zoho_contact_id: newContactId 
          })
          .eq('user_id', userId);

        console.log('Contact created and profile updated');

        return new Response(
          JSON.stringify({
            success: true,
            contactId: newContactId,
            directCreation: true
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        throw new Error(`Failed to create contact: ${JSON.stringify(contactResult)}`);
      }
    }

    // Check if already converted
    if (profile.zoho_contact_id) {
      console.log('Lead already converted to contact:', profile.zoho_contact_id);
      return new Response(
        JSON.stringify({ 
          success: true, 
          alreadyConverted: true,
          contactId: profile.zoho_contact_id 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare conversion data
    const closingDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const dealName = `${profile.first_name || ''} ${profile.last_name || ''} - ${planName}`.trim();

    const conversionData = {
      data: [{
        overwrite: false,
        notify_lead_owner: true,
        notify_new_entity_owner: false,
        Contacts: {
          Contact_Status: 'Active'
        },
        Deals: {
          Deal_Name: dealName,
          Closing_Date: closingDate,
          Stage: "Closed Won",
          Amount: planAmount
        }
      }]
    };

    console.log('Calling Zoho conversion API for lead:', profile.zoho_lead_id);

    // Convert lead to contact in Zoho
    const conversionResponse = await zohoRequest(
      'POST',
      `Leads/${profile.zoho_lead_id}/actions/convert`,
      conversionData
    );

    console.log('Zoho conversion response:', JSON.stringify(conversionResponse));

    // Extract IDs from response
    const responseData = conversionResponse.data?.[0];
    const contactId = responseData?.Contacts;
    const accountId = responseData?.Accounts;
    const dealId = responseData?.Deals;

    if (!contactId) {
      throw new Error('No Contact ID returned from Zoho conversion');
    }

    // Update profile with conversion IDs
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        zoho_contact_id: contactId,
        zoho_account_id: accountId,
        zoho_deal_id: dealId,
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Failed to update profile with Zoho IDs:', updateError);
      throw updateError;
    }

    // Update referral tracking status to 'converted'
    await supabaseClient
      .from('user_referrals')
      .update({ 
        status: 'converted',
        zoho_contact_id: contactId 
      })
      .eq('user_id', userId);

    console.log('Successfully converted lead to contact:', contactId);

    return new Response(
      JSON.stringify({
        success: true,
        contactId,
        accountId,
        dealId,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error converting Zoho lead:', error);

    // Try to log failure to database
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const requestBody = await req.json().catch(() => ({}));
      const { userId, planAmount, planName } = requestBody as ConversionRequest;

      if (userId) {
        // Get zoho_lead_id for logging
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('zoho_lead_id')
          .eq('id', userId)
          .single();

        await supabaseClient
          .from('zoho_conversion_failures')
          .insert({
            user_id: userId,
            zoho_lead_id: profile?.zoho_lead_id || 'unknown',
            error_message: error.message || 'Unknown error',
            error_details: { 
              error: String(error),
              stack: error.stack 
            },
            plan_type: planName || 'Premium Pro',
            plan_amount: planAmount || 25000,
          });
      }
    } catch (logError) {
      console.error('Failed to log conversion failure:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Conversion failed',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
