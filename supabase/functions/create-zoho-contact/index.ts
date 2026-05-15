import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { zohoRequest } from "../_shared/zoho.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactData {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  company?: string;
  phone?: string;
  referralCode?: string;
  leadSource?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const body: ContactData = await req.json();

    // Validate required fields
    const { userId, email, firstName, lastName, fullName, company, phone, referralCode, leadSource } = body;

    if (!userId || !email) {
      console.error('Missing required fields:', { userId, email });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: userId, email' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Smart name handling with fallbacks
    let finalFirstName = firstName;
    let finalLastName = lastName;

    if (!finalFirstName || !finalLastName) {
      if (fullName) {
        const spaceIndex = fullName.indexOf(' ');
        if (spaceIndex > 0) {
          finalFirstName = finalFirstName || fullName.substring(0, spaceIndex).trim();
          finalLastName = finalLastName || fullName.substring(spaceIndex + 1).trim();
        } else {
          finalFirstName = finalFirstName || fullName.trim();
          finalLastName = finalLastName || fullName.trim();
        }
      } else {
        const emailUsername = email.split('@')[0];
        finalFirstName = finalFirstName || emailUsername;
        finalLastName = finalLastName || emailUsername;
      }
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user was referred - find referrer's Zoho Contact ID
    let referrerContactId: string | null = null;

    if (referralCode) {
      // Find referrer by referral code
      const { data: referrerProfile } = await supabase
        .from('profiles')
        .select('id, zoho_contact_id')
        .eq('referral_code', referralCode)
        .maybeSingle();
      
      if (referrerProfile?.zoho_contact_id) {
        referrerContactId = referrerProfile.zoho_contact_id;
        
        // Store referral relationship in profiles (if not already set)
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('referred_by_user_id')
          .eq('id', userId)
          .single();
        
        if (!existingProfile?.referred_by_user_id) {
          await supabase
            .from('profiles')
            .update({
              referred_by_user_id: referrerProfile.id,
              zoho_referrer_contact_id: referrerProfile.zoho_contact_id,
              pending_referral_code: null
            })
            .eq('id', userId);
        }
        
        // Create referral tracking record (if not exists)
        const { data: existingReferral } = await supabase
          .from('user_referrals')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (!existingReferral) {
          await supabase
            .from('user_referrals')
            .insert({
              user_id: userId,
              referred_by_user_id: referrerProfile.id,
              referral_code_used: referralCode,
              status: 'pending'
            });
        }
      }
    }

    // Prepare contact data for Zoho - Create Contact directly with User_Type = Basic
    const currentDate = new Date().toISOString().split('T')[0];
    
    const contactPayload = {
      data: [
        {
          Last_Name: finalLastName,
          First_Name: finalFirstName,
          Email: email,
          Phone: phone || null,
          User_Type: 'Basic', // NEW FIELD - all signups start as Basic
          Lead_Source: referrerContactId ? 'External Referral' : (leadSource || 'Website Signup'),
          Description: `Signed up via Google OAuth on ${currentDate}${referrerContactId ? ' (Referred)' : ''}`,
          ...(referrerContactId && { Referral_Contact: { id: referrerContactId } })
        },
      ],
    };

    // Search for existing Zoho contact with this email before creating
    let contactId: string | null = null;
    let isExisting = false;

    try {
      const searchResponse = await zohoRequest('GET', `Contacts/search?email=${encodeURIComponent(email)}&fields=id,Email`);
      if (searchResponse.data && searchResponse.data.length > 0) {
        contactId = searchResponse.data[0].id;
        isExisting = true;
        console.log('Found existing Zoho contact:', contactId);
      }
    } catch (_) {
      // 204 No Content when no results — not an error
      console.log('No existing contact found for email:', email);
    }

    let zohoResponse: any;

    if (isExisting && contactId) {
      // Update existing contact rather than creating a duplicate
      zohoResponse = await zohoRequest('PUT', `Contacts/${contactId}`, { data: [contactPayload.data[0]] });
      console.log('Updated existing Zoho contact:', JSON.stringify(zohoResponse));
    } else {
      console.log('Creating new Zoho Contact with payload:', JSON.stringify(contactPayload));
      zohoResponse = await zohoRequest('POST', 'Contacts', contactPayload);
      console.log('Zoho API response:', JSON.stringify(zohoResponse));
    }

    // Resolve contactId from create response if new
    if (!isExisting) {
      if (zohoResponse.data && zohoResponse.data[0] && zohoResponse.data[0].code === 'SUCCESS') {
        contactId = zohoResponse.data[0].details.id;
      }
    }

    if (contactId) {
      console.log(isExisting ? 'Linked to existing contact:' : 'Contact created successfully:', contactId);

      // Update profile with Zoho contact ID (not lead ID)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          zoho_contact_id: contactId,
          zoho_sync_status: 'synced',
          zoho_sync_error: null,
          pending_referral_code: null,
        })
        .eq('id', userId);

      // Update referral tracking with zoho_contact_id
      if (referralCode) {
        await supabase
          .from('user_referrals')
          .update({ zoho_contact_id: contactId })
          .eq('user_id', userId);
      }

      if (updateError) {
        console.error('Failed to update profile:', updateError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Contact created but failed to update profile: ${updateError.message}`,
            contactId,
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          contactId,
          message: isExisting ? 'Linked to existing contact' : 'Contact created successfully',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } else {
      // Contact creation/update failed
      const errorMessage = zohoResponse?.data?.[0]?.message || 'Unknown error from Zoho API';
      console.error('Zoho contact operation failed:', errorMessage);

      await supabase
        .from('profiles')
        .update({
          zoho_sync_status: 'failed',
          zoho_sync_error: errorMessage,
        })
        .eq('id', userId);

      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error('Error in create-zoho-contact function:', error);

    // Try to update profile with error if we have userId
    try {
      const body = await req.clone().json();
      if (body.userId) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        await supabase
          .from('profiles')
          .update({
            zoho_sync_status: 'failed',
            zoho_sync_error: error instanceof Error ? error.message : 'Unknown error',
          })
          .eq('id', body.userId);
      }
    } catch (e) {
      console.error('Failed to update profile with error:', e);
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
