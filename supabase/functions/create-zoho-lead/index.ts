import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { zohoRequest } from "../_shared/zoho.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeadData {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  company?: string;
  phone?: string;
  referralCode?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const body: LeadData = await req.json();

    // Validate required fields
    const { userId, email, firstName, lastName, fullName, company, phone, referralCode } = body;

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

    // Check if user was referred
    let referrerContactId: string | null = null;

    if (referralCode) {
      // Find referrer by referral code
      const { data: referrerProfile } = await supabase
        .from('profiles')
        .select('id, zoho_contact_id, zoho_lead_id')
        .eq('referral_code', referralCode)
        .maybeSingle();
      
      if (referrerProfile) {
        referrerContactId = referrerProfile.zoho_contact_id || referrerProfile.zoho_lead_id;
        
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

    // Prepare lead data for Zoho
    const currentDate = new Date().toISOString().split('T')[0];
    
    const leadPayload = {
      data: [
        {
          Last_Name: finalLastName,
          First_Name: finalFirstName,
          Email: email,
          Company: company || 'Customer',
          Phone: phone || null,
          Lead_Source: referrerContactId ? 'External Referral' : 'Google Signup',
          Description: `Signed up via Google OAuth on ${currentDate}${referrerContactId ? ' (Referred)' : ''}`,
          ...(referrerContactId && { Referral_Contact: { id: referrerContactId } })
        },
      ],
    };

    // Create lead in Zoho CRM
    const zohoResponse = await zohoRequest('POST', 'Leads', leadPayload);

    // Check if lead creation was successful
    if (zohoResponse.data && zohoResponse.data[0] && zohoResponse.data[0].code === 'SUCCESS') {
      const leadId = zohoResponse.data[0].details.id;

      // Update profile with Zoho lead ID
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          zoho_lead_id: leadId,
          zoho_sync_status: 'synced',
          zoho_sync_error: null,
          pending_referral_code: null,
        })
        .eq('id', userId);

      // Update referral tracking with zoho_lead_id
      if (referralCode) {
        await supabase
          .from('user_referrals')
          .update({ zoho_lead_id: leadId })
          .eq('user_id', userId);
      }

      if (updateError) {
        console.error('Failed to update profile:', updateError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Lead created but failed to update profile: ${updateError.message}`,
            leadId,
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
          leadId,
          message: 'Lead created successfully',
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      // Lead creation failed
      const errorMessage = zohoResponse.data?.[0]?.message || 'Unknown error from Zoho API';
      console.error('Zoho lead creation failed:', errorMessage);

      // Update profile with error status
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
    console.error('Error in create-zoho-lead function:', error);

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
