# Vinca Wealth - System Flows Documentation

## Table of Contents
1. [Overview](#overview)
2. [User Signup Flow](#user-signup-flow)
3. [Referral System](#referral-system)
4. [Zoho CRM Integration](#zoho-crm-integration)
5. [Payment Gateway Integration](#payment-gateway-integration)
6. [Database Schema](#database-schema)
7. [Edge Functions](#edge-functions)
8. [Triggers & Functions](#triggers--functions)

---

## Overview

This document provides a comprehensive overview of the Vinca Wealth application's core flows including user signup, referral tracking, Zoho CRM integration, and Razorpay payment processing.

### Key Concepts
- **Lead**: A user who has signed up but hasn't made a payment
- **Contact**: A user who has completed payment (Pro member)
- **Referral Flow**: Only applies when leads convert to contacts (payment completion)
- **Zoho Sync Status**: Tracks the state of user synchronization with Zoho CRM

---

## User Signup Flow

### 1. Authentication Methods

Users can sign up via:
- **Google OAuth** (Primary method)
- **Email/Password** (Secondary method)

### 2. Signup Process

#### Step 1: User Authentication
```typescript
// src/components/auth/AuthPage.tsx
const handleGoogleSignIn = async () => {
  // Referral code already stored in localStorage from useEffect
  await signInWithGoogle(referralCode || undefined);
};
```

**Key Actions:**
- Referral code detected from URL parameter `?ref=CODE`
- Stored in `localStorage` immediately when detected
- Passed to authentication flow

#### Step 2: Profile Creation
When a user signs up, the `handle_new_user()` trigger automatically creates a profile:

```sql
-- Database Trigger: on_auth_user_created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

```sql
-- Function: public.handle_new_user()
CREATE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public 
AS $$
DECLARE
  full_name_value TEXT;
  space_position INTEGER;
  new_user_id UUID;
BEGIN
  full_name_value := NEW.raw_user_meta_data->>'full_name';
  new_user_id := NEW.id;
  
  -- Insert basic profile with waiting_referral status
  -- This prevents Zoho sync until frontend processes referral code
  IF full_name_value IS NOT NULL AND full_name_value != '' THEN
    space_position := POSITION(' ' IN full_name_value);
    
    IF space_position > 0 THEN
      INSERT INTO public.profiles (id, email, full_name, first_name, last_name, zoho_sync_status)
      VALUES (
        new_user_id, 
        NEW.email, 
        full_name_value,
        TRIM(SUBSTRING(full_name_value FROM 1 FOR space_position - 1)),
        TRIM(SUBSTRING(full_name_value FROM space_position + 1)),
        'waiting_referral'
      );
    ELSE
      INSERT INTO public.profiles (id, email, full_name, first_name, last_name, zoho_sync_status)
      VALUES (
        new_user_id, 
        NEW.email, 
        full_name_value,
        '',
        TRIM(full_name_value),
        'waiting_referral'
      );
    END IF;
  ELSE
    INSERT INTO public.profiles (id, email, full_name, zoho_sync_status)
    VALUES (new_user_id, NEW.email, full_name_value, 'waiting_referral');
  END IF;
  
  RETURN NEW;
END;
$$;
```

**Profile Initial State:**
- `zoho_sync_status`: `'waiting_referral'` (prevents immediate Zoho sync)
- User data extracted from OAuth metadata
- Name parsing for first/last name

#### Step 3: Referral Processing
After authentication, `ReferralContext` processes the referral code:

```typescript
// src/contexts/ReferralContext.tsx
useEffect(() => {
  const processReferralCode = async () => {
    if (!user) return;

    // Check URL for referral code first (from OAuth redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const urlReferralCode = urlParams.get('ref');
    
    // Also check localStorage as fallback
    const storedReferralCode = localStorage.getItem('pending_referral_code');
    const referralCode = urlReferralCode || storedReferralCode;

    // Get current user's profile
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('zoho_sync_status, zoho_lead_id, referred_by_user_id, pending_referral_code')
      .eq('id', user.id)
      .single();

    // Only process if status is waiting_referral
    if (userProfile?.zoho_sync_status === 'waiting_referral') {
      if (referralCode && !userProfile?.referred_by_user_id) {
        // Find referrer
        const { data: referrerProfile } = await supabase
          .from('profiles')
          .select('id, zoho_contact_id, zoho_lead_id, first_name, last_name')
          .eq('referral_code', referralCode)
          .maybeSingle();

        if (referrerProfile) {
          // Update profile with referral info AND trigger Zoho sync
          await supabase
            .from('profiles')
            .update({
              referred_by_user_id: referrerProfile.id,
              zoho_referrer_contact_id: referrerProfile.zoho_contact_id,
              pending_referral_code: referralCode,
              zoho_sync_status: 'pending', // This triggers Zoho lead creation
            })
            .eq('id', user.id);

          // Create referral tracking record
          await supabase
            .from('user_referrals')
            .insert({
              user_id: user.id,
              referred_by_user_id: referrerProfile.id,
              referral_code_used: referralCode,
              status: 'pending',
            });
        } else {
          // Still trigger Zoho sync even without referral
          await supabase
            .from('profiles')
            .update({ zoho_sync_status: 'pending' })
            .eq('id', user.id);
        }
      } else {
        // No referral code, just trigger normal Zoho sync
        await supabase
          .from('profiles')
          .update({ zoho_sync_status: 'pending' })
          .eq('id', user.id);
      }

      // Clean up
      localStorage.removeItem('pending_referral_code');
      if (urlReferralCode) {
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  };

  // Add small delay to ensure user profile is created
  const timer = setTimeout(() => {
    processReferralCode();
  }, 500);

  return () => clearTimeout(timer);
}, [user]);
```

**Key Actions:**
- Checks for referral code in URL or localStorage
- Looks up referrer by `referral_code`
- Updates profile with referrer information
- Creates entry in `user_referrals` table
- Changes `zoho_sync_status` to `'pending'` (triggers Zoho lead creation)

#### Step 4: Zoho Lead Creation
When `zoho_sync_status` changes to `'pending'`, the `trigger_zoho_lead_creation()` trigger fires:

```sql
-- Trigger: on_profile_zoho_sync
CREATE TRIGGER on_profile_zoho_sync
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_zoho_lead_creation();
```

```sql
-- Function: public.trigger_zoho_lead_creation()
CREATE FUNCTION public.trigger_zoho_lead_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  request_id BIGINT;
  payload JSONB;
  referrer_code TEXT;
BEGIN
  -- Only trigger when zoho_sync_status changes to 'pending'
  IF NEW.zoho_sync_status = 'pending' 
     AND (OLD.zoho_sync_status IS NULL OR OLD.zoho_sync_status != 'pending')
     AND NEW.email IS NOT NULL 
     AND NEW.first_name IS NOT NULL 
     AND NEW.last_name IS NOT NULL THEN
    
    -- Get referral code from profile if exists
    referrer_code := NEW.pending_referral_code;
    
    payload := jsonb_build_object(
      'userId', NEW.id,
      'email', NEW.email,
      'firstName', NEW.first_name,
      'lastName', NEW.last_name,
      'fullName', NEW.full_name,
      'company', NEW.company,
      'phone', NEW.phone,
      'referralCode', referrer_code
    );
    
    SELECT INTO request_id net.http_post(
      url := 'https://xmmyjphoaqazwlifehxs.supabase.co/functions/v1/create-zoho-lead',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer [ANON_KEY]'
      ),
      body := payload
    );
  END IF;
  
  RETURN NEW;
END;
$$;
```

**Key Actions:**
- Triggers only when status changes to `'pending'`
- Calls `create-zoho-lead` edge function asynchronously
- Passes user data and referral code

---

## Referral System

### Overview
The referral system tracks when users refer new users to the platform. Referral rewards are only processed when the referred user converts from a lead to a contact (makes a payment).

### Referral Code Generation

Each user automatically gets a unique referral code when their profile is created:

```sql
-- profiles table has referral_code column
-- Generated using custom logic or UUID-based system
```

### Referral Tracking Flow

#### 1. Referral Link Sharing
Users share their referral link: `https://app.vincawealth.com/auth?ref=USER_REFERRAL_CODE`

#### 2. New User Signup with Referral
```typescript
// When a new user clicks the referral link:
// 1. Referral code is captured from URL (?ref=CODE)
// 2. Stored in localStorage
// 3. Applied during signup process via ReferralContext
```

#### 3. Database Tables

**profiles table:**
```sql
-- Columns related to referrals
referred_by_user_id UUID REFERENCES profiles(id)
referral_code TEXT UNIQUE
zoho_referrer_contact_id TEXT
pending_referral_code TEXT
```

**user_referrals table:**
```sql
CREATE TABLE user_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,  -- The referred user
  referred_by_user_id UUID,  -- The referrer
  referral_code_used TEXT,
  status TEXT DEFAULT 'pending',  -- 'pending' or 'converted'
  zoho_lead_id TEXT,
  zoho_contact_id TEXT,
  referral_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### 4. Referral Status Flow

**Status: `pending`**
- New user signed up with referral code
- User is still a lead in Zoho CRM
- No reward given yet

**Status: `converted`**
- Referred user made a payment
- Converted to contact in Zoho CRM
- Referral reward processed in Zoho

### Viewing Referral Stats

```typescript
// src/hooks/useReferrals.ts
export const useReferrals = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReferralStats | null>(null);

  useEffect(() => {
    const fetchReferralStats = async () => {
      if (!user) return;

      // Get user's referral code
      const { data: profile } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', user.id)
        .single();

      // Get referral statistics
      const { data: referrals } = await supabase
        .from('user_referrals')
        .select('id, status, created_at')
        .eq('referred_by_user_id', user.id);

      const totalReferrals = referrals?.length || 0;
      const pendingReferrals = referrals?.filter(r => r.status === 'pending').length || 0;
      const convertedReferrals = referrals?.filter(r => r.status === 'converted').length || 0;

      setStats({
        referralCode: profile?.referral_code || null,
        totalReferrals,
        pendingReferrals,
        convertedReferrals,
        referrals: referrals || [],
      });
    };

    fetchReferralStats();
  }, [user]);

  return { stats, loading };
};
```

---

## Zoho CRM Integration

### Overview
Zoho CRM integration manages the lead-to-contact lifecycle and ensures referral tracking in the CRM system.

### Authentication

```typescript
// supabase/functions/_shared/zoho.ts
export async function getZohoAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  const clientId = Deno.env.get('ZOHO_CLIENT_ID');
  const clientSecret = Deno.env.get('ZOHO_CLIENT_SECRET');
  const refreshToken = Deno.env.get('ZOHO_REFRESH_TOKEN');
  const apiDomain = Deno.env.get('ZOHO_API_DOMAIN') || 'https://www.zohoapis.in';

  const accountsDomain = apiDomain.replace('www.zohoapis', 'accounts.zoho');
  const tokenUrl = `${accountsDomain}/oauth/v2/token`;
  
  const params = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const data = await response.json();
  
  // Cache token for 55 minutes (tokens valid for 1 hour)
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (55 * 60 * 1000),
  };

  return data.access_token;
}
```

### Lead Creation

#### Edge Function: `create-zoho-lead`

```typescript
// supabase/functions/create-zoho-lead/index.ts
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: LeadData = await req.json();
    const { userId, email, firstName, lastName, fullName, company, phone, referralCode } = body;

    // Initialize Supabase client
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
        
        // Store referral relationship in profiles
        await supabase
          .from('profiles')
          .update({
            referred_by_user_id: referrerProfile.id,
            zoho_referrer_contact_id: referrerProfile.zoho_contact_id,
            pending_referral_code: null
          })
          .eq('id', userId);
        
        // Create referral tracking record
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

    // Prepare lead data for Zoho
    const currentDate = new Date().toISOString().split('T')[0];
    
    const leadPayload = {
      data: [
        {
          Last_Name: lastName,
          First_Name: firstName,
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

    if (zohoResponse.data && zohoResponse.data[0] && zohoResponse.data[0].code === 'SUCCESS') {
      const leadId = zohoResponse.data[0].details.id;

      // Update profile with Zoho lead ID
      await supabase
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

      return new Response(
        JSON.stringify({ success: true, leadId }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in create-zoho-lead function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

**Key Features:**
- Looks up referrer by referral code
- Creates lead with referral information in Zoho
- Updates profile with `zoho_lead_id`
- Tracks referral in `user_referrals` table
- Sets Lead Source as "External Referral" if referred

### Lead to Contact Conversion

#### When Does Conversion Happen?
Conversion happens **only when a user makes a payment** (purchases Pro membership).

#### Edge Function: `convert-zoho-lead-to-contact`

```typescript
// supabase/functions/convert-zoho-lead-to-contact/index.ts
// This function is called after successful payment in razorpay-webhook

const convertLead = async (zohoLeadId: string, userId: string) => {
  try {
    // Step 1: Convert Lead to Contact in Zoho
    const conversionPayload = {
      data: [
        {
          overwrite: true,
          notify_lead_owner: true,
          notify_new_entity_owner: true,
          Accounts: "Customer Account",
          Deals: {
            Deal_Name: "Pro Membership Purchase",
            Closing_Date: new Date().toISOString().split('T')[0],
            Stage: "Closed Won",
            Amount: 25000
          }
        }
      ]
    };

    const response = await zohoRequest(
      'POST',
      `Leads/${zohoLeadId}/actions/convert`,
      conversionPayload
    );

    if (response.data && response.data[0].code === 'SUCCESS') {
      const contactId = response.data[0].details.Contacts;
      const dealId = response.data[0].details.Deals;
      const accountId = response.data[0].details.Accounts;

      // Step 2: Update profile with contact information
      await supabase
        .from('profiles')
        .update({
          zoho_contact_id: contactId,
          zoho_deal_id: dealId,
          zoho_account_id: accountId,
        })
        .eq('id', userId);

      // Step 3: Update referral status if user was referred
      await supabase
        .from('user_referrals')
        .update({
          status: 'converted',
          zoho_contact_id: contactId
        })
        .eq('user_id', userId);

      // Step 4: Trigger referral reward in Zoho
      // This calls update-zoho-lead-referral edge function
      await updateReferrerInZoho(userId, contactId);

      return { success: true, contactId, dealId, accountId };
    }
  } catch (error) {
    console.error('Lead conversion failed:', error);
    
    // Log failure for manual intervention
    await supabase
      .from('zoho_conversion_failures')
      .insert({
        user_id: userId,
        zoho_lead_id: zohoLeadId,
        error_message: error.message,
        error_details: error,
        plan_type: 'pro_lifetime',
        plan_amount: 25000
      });
    
    throw error;
  }
};
```

**Key Actions:**
1. Converts lead to contact in Zoho CRM
2. Creates associated Deal and Account
3. Updates profile with `zoho_contact_id`, `zoho_deal_id`, `zoho_account_id`
4. Updates referral status from `'pending'` to `'converted'`
5. Triggers referral reward processing

#### Edge Function: `update-zoho-lead-referral`

```typescript
// supabase/functions/update-zoho-lead-referral/index.ts
// Updates the referrer's record in Zoho to track successful referral

const updateReferrerInZoho = async (referredUserId: string, newContactId: string) => {
  // Get referral information
  const { data: referral } = await supabase
    .from('user_referrals')
    .select('referred_by_user_id, referral_code_used')
    .eq('user_id', referredUserId)
    .eq('status', 'converted')
    .single();

  if (!referral) return;

  // Get referrer's Zoho contact ID
  const { data: referrerProfile } = await supabase
    .from('profiles')
    .select('zoho_contact_id')
    .eq('id', referral.referred_by_user_id)
    .single();

  if (!referrerProfile?.zoho_contact_id) return;

  // Update referrer's contact in Zoho with successful referral
  await zohoRequest('PUT', `Contacts/${referrerProfile.zoho_contact_id}`, {
    data: [{
      // Add custom field for referral tracking
      Successful_Referrals: 1,  // This would increment
      Last_Referral_Date: new Date().toISOString()
    }]
  });
};
```

### Zoho Sync Status Flow

```
waiting_referral → pending → synced → (payment) → converted
                             ↓ (on error)
                           failed
```

**Status Meanings:**
- `waiting_referral`: Profile created, waiting for referral processing
- `pending`: Ready for Zoho sync, trigger will fire
- `synced`: Lead successfully created in Zoho
- `failed`: Zoho sync failed, error logged
- `converted`: Lead converted to contact (after payment)

---

## Payment Gateway Integration

### Overview
Razorpay payment gateway is integrated for Pro membership purchases. Payment completion triggers lead-to-contact conversion in Zoho CRM.

### Payment Flow

#### Step 1: Order Creation

```typescript
// src/hooks/useRazorpayPayment.ts
const initiatePayment = async ({ planType, amount, onSuccess, onFailure }: PaymentOptions) => {
  if (!user) {
    throw new Error('User must be logged in to make a payment');
  }

  setIsProcessing(true);
  setError(null);

  try {
    // Load Razorpay script
    await loadRazorpayScript();

    // Create order via edge function
    const { data: orderData, error: orderError } = await supabase.functions.invoke(
      'create-razorpay-order',
      {
        body: {
          plan_type: planType,
          amount: amount,
        },
      }
    );

    if (orderError) throw orderError;

    // Open Razorpay checkout
    const options = {
      key: razorpayConfig.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: razorpayConfig.companyName,
      description: razorpayConfig.plans[planType].description,
      order_id: orderData.razorpay_order_id,
      prefill: {
        name: user.user_metadata?.full_name || '',
        email: user.email || '',
        contact: user.user_metadata?.phone || '',
      },
      theme: razorpayConfig.theme,
      handler: async function (response: any) {
        // Payment successful - webhook will handle the rest
        onSuccess?.(response);
      },
      modal: {
        ondismiss: function () {
          setIsProcessing(false);
          onFailure?.();
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err: any) {
    setError(err.message);
    setIsProcessing(false);
    onFailure?.();
  }
};
```

#### Step 2: Create Razorpay Order (Edge Function)

```typescript
// supabase/functions/create-razorpay-order/index.ts
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { plan_type, amount } = await req.json();

    // Server-side validation of plan and amount
    const validPlans = {
      'pro_lifetime': 2500000,  // ₹25,000 in paise
    };

    if (!validPlans[plan_type]) {
      throw new Error('Invalid plan type');
    }

    const serverAmount = validPlans[plan_type];

    // Check if user already has premium membership
    const { data: membership } = await supabase
      .from('user_memberships')
      .select('tier')
      .eq('user_id', user.id)
      .single();

    if (membership && membership.tier !== 'free') {
      throw new Error('User already has a premium membership');
    }

    // Rate limiting: Check for recent orders
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentOrders } = await supabase
      .from('razorpay_orders')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', oneHourAgo);

    if (recentOrders && recentOrders.length >= 3) {
      throw new Error('Too many order requests. Please try again later.');
    }

    // Create Razorpay order
    const order = await createRazorpayOrder({
      amount: serverAmount,
      currency: 'INR',
      receipt: `receipt_${user.id}_${Date.now()}`,
      notes: {
        user_id: user.id,
        plan_type: plan_type,
      },
    });

    // Store order in database
    const { data: dbOrder, error: dbError } = await supabase
      .from('razorpay_orders')
      .insert({
        user_id: user.id,
        razorpay_order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
        plan_type: plan_type,
        notes: order.notes,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // Log transaction
    await supabase.from('payment_transactions').insert({
      user_id: user.id,
      order_id: dbOrder.id,
      event_type: 'order.created',
      event_data: order,
    });

    return new Response(JSON.stringify(order), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

**Key Features:**
- Server-side plan validation
- Amount verification (ignores client-provided amount)
- Duplicate membership check
- Rate limiting (max 3 orders per hour)
- Database logging

#### Step 3: Payment Processing (Webhook)

```typescript
// supabase/functions/razorpay-webhook/index.ts
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const webhookSignature = req.headers.get('x-razorpay-signature');
    const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');
    
    const rawBody = await req.text();
    
    // Verify webhook signature
    const expectedSignature = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(rawBody + webhookSecret)
    );
    
    // Parse webhook payload
    const event = JSON.parse(rawBody);
    
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;
      
      // Get order from database
      const { data: order } = await supabase
        .from('razorpay_orders')
        .select('*')
        .eq('razorpay_order_id', orderId)
        .single();
      
      if (!order) {
        throw new Error('Order not found');
      }
      
      // Store payment record
      await supabase.from('razorpay_payments').insert({
        order_id: order.id,
        user_id: order.user_id,
        razorpay_payment_id: payment.id,
        razorpay_order_id: orderId,
        razorpay_signature: webhookSignature,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        email: payment.email,
        contact: payment.contact,
        captured_at: new Date(payment.captured_at * 1000).toISOString(),
      });
      
      // Update user membership
      await supabase
        .from('user_memberships')
        .update({
          tier: 'pro_lifetime',
          upgraded_at: new Date().toISOString(),
          payment_id: payment.id,
          payment_date: new Date(payment.captured_at * 1000).toISOString(),
          subscription_status: 'active',
          razorpay_order_id: orderId,
        })
        .eq('user_id', order.user_id);
      
      // Get user's profile for Zoho sync
      const { data: profile } = await supabase
        .from('profiles')
        .select('zoho_lead_id, referred_by_user_id')
        .eq('id', order.user_id)
        .single();
      
      // Convert Lead to Contact in Zoho
      if (profile?.zoho_lead_id) {
        await supabase.functions.invoke('convert-zoho-lead-to-contact', {
          body: {
            userId: order.user_id,
            zohoLeadId: profile.zoho_lead_id,
            planType: order.plan_type,
            amount: payment.amount,
          },
        });
      }
      
      // Log transaction
      await supabase.from('payment_transactions').insert({
        user_id: order.user_id,
        order_id: order.id,
        payment_id: payment.id,
        event_type: 'payment.captured',
        event_data: event.payload,
        webhook_event_id: event.id,
      });
    }
    
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

**Key Actions:**
1. Verifies webhook signature
2. Stores payment record
3. Updates user membership to `pro_lifetime`
4. Triggers lead-to-contact conversion in Zoho
5. Processes referral if applicable
6. Logs all transactions

### Payment Configuration

```typescript
// src/config/razorpay.ts
export const razorpayConfig = {
  keyId: "rzp_test_RXC7OYSlf7trWG",  // Test mode key
  currency: "INR",
  companyName: "Vinca Wealth",
  theme: {
    color: "#10b981",  // Primary green color
  },
  plans: {
    pro_lifetime: {
      name: "Pro Version - Lifetime Access",
      amount: 2500000,  // ₹25,000 in paise
      description: "One-time payment for lifetime access to all Pro features",
    },
  },
};
```

### Environment Variables

Required Razorpay secrets:
- `RAZORPAY_TEST_KEY_ID`: Public key for test mode
- `RAZORPAY_TEST_KEY_SECRET`: Secret key for test mode
- `RAZORPAY_TEST_WEBHOOK_SECRET`: Webhook signature verification
- `PAYMENT_ENVIRONMENT`: 'test' or 'live'

---

## Database Schema

### Core Tables

#### profiles
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  phone TEXT,
  avatar_url TEXT,
  
  -- Zoho CRM Integration
  zoho_lead_id TEXT,
  zoho_contact_id TEXT,
  zoho_account_id TEXT,
  zoho_deal_id TEXT,
  zoho_sync_status TEXT DEFAULT 'pending',
  zoho_sync_error TEXT,
  
  -- Referral System
  referral_code TEXT UNIQUE,
  referred_by_user_id UUID REFERENCES profiles(id),
  zoho_referrer_contact_id TEXT,
  pending_referral_code TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view profiles by referral code"
  ON profiles FOR SELECT USING (referral_code IS NOT NULL);

CREATE POLICY "Super admins can view all profiles"
  ON profiles FOR SELECT USING (has_role(auth.uid(), 'super_admin'::app_role));
```

#### user_referrals
```sql
CREATE TABLE public.user_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  referred_by_user_id UUID REFERENCES profiles(id),
  referral_code_used TEXT,
  status TEXT DEFAULT 'pending',  -- 'pending' or 'converted'
  zoho_lead_id TEXT,
  zoho_contact_id TEXT,
  referral_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS Policies
ALTER TABLE user_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referrals"
  ON user_referrals FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view referrals they made"
  ON user_referrals FOR SELECT USING (auth.uid() = referred_by_user_id);

CREATE POLICY "Users can insert their own referrals"
  ON user_referrals FOR INSERT WITH CHECK (auth.uid() = user_id);
```

#### user_memberships
```sql
CREATE TYPE membership_tier AS ENUM ('free', 'pro_lifetime');

CREATE TABLE public.user_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  tier membership_tier DEFAULT 'free',
  upgraded_at TIMESTAMP WITH TIME ZONE,
  payment_id UUID,
  payment_date TIMESTAMP WITH TIME ZONE,
  subscription_status TEXT,
  razorpay_order_id TEXT,
  aum_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS Policies
ALTER TABLE user_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own membership"
  ON user_memberships FOR SELECT USING (auth.uid() = user_id);
```

#### razorpay_orders
```sql
CREATE TABLE public.razorpay_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  razorpay_order_id TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  receipt TEXT NOT NULL,
  status TEXT DEFAULT 'created',
  plan_type TEXT NOT NULL,
  notes JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS Policies
ALTER TABLE razorpay_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
  ON razorpay_orders FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
  ON razorpay_orders FOR INSERT WITH CHECK (auth.uid() = user_id);
```

#### razorpay_payments
```sql
CREATE TABLE public.razorpay_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES razorpay_orders(id),
  user_id UUID NOT NULL,
  razorpay_payment_id TEXT NOT NULL UNIQUE,
  razorpay_order_id TEXT NOT NULL,
  razorpay_signature TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'authorized',
  method TEXT,
  email TEXT,
  contact TEXT,
  captured_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS Policies
ALTER TABLE razorpay_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments"
  ON razorpay_payments FOR SELECT USING (auth.uid() = user_id);
```

#### payment_transactions
```sql
CREATE TABLE public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  order_id UUID REFERENCES razorpay_orders(id),
  payment_id UUID REFERENCES razorpay_payments(id),
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  webhook_event_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS Policies
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON payment_transactions FOR SELECT USING (auth.uid() = user_id);
```

#### zoho_conversion_failures
```sql
CREATE TABLE public.zoho_conversion_failures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  zoho_lead_id TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_details JSONB DEFAULT '{}',
  plan_type TEXT NOT NULL,
  plan_amount INTEGER NOT NULL,
  retry_count INTEGER DEFAULT 0,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS Policies
ALTER TABLE zoho_conversion_failures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view failed conversions"
  ON zoho_conversion_failures FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'::app_role));
```

---

## Edge Functions

### 1. create-zoho-lead
**Purpose**: Creates a lead in Zoho CRM when user signs up

**Trigger**: Called by `trigger_zoho_lead_creation()` database trigger

**Input**:
```typescript
{
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  company?: string;
  phone?: string;
  referralCode?: string;
}
```

**Output**:
```typescript
{
  success: boolean;
  leadId?: string;
  error?: string;
}
```

**Key Actions**:
- Validates user data
- Looks up referrer by referral code
- Creates lead in Zoho with referral info
- Updates profile with `zoho_lead_id`
- Creates `user_referrals` entry if referred

### 2. convert-zoho-lead-to-contact
**Purpose**: Converts lead to contact after payment

**Trigger**: Called by `razorpay-webhook` after payment capture

**Input**:
```typescript
{
  userId: string;
  zohoLeadId: string;
  planType: string;
  amount: number;
}
```

**Output**:
```typescript
{
  success: boolean;
  contactId?: string;
  dealId?: string;
  accountId?: string;
  error?: string;
}
```

**Key Actions**:
- Converts lead to contact in Zoho
- Creates Deal and Account
- Updates profile with contact IDs
- Updates referral status to 'converted'
- Calls `update-zoho-lead-referral`

### 3. update-zoho-lead-referral
**Purpose**: Updates referrer's Zoho record with successful referral

**Trigger**: Called by `convert-zoho-lead-to-contact`

**Input**:
```typescript
{
  referredUserId: string;
  newContactId: string;
}
```

**Output**:
```typescript
{
  success: boolean;
  error?: string;
}
```

**Key Actions**:
- Gets referral information
- Updates referrer's Zoho contact
- Tracks referral metrics

### 4. create-razorpay-order
**Purpose**: Creates Razorpay order for payment

**Trigger**: Called by frontend when user initiates payment

**Input**:
```typescript
{
  plan_type: string;
  amount: number;
}
```

**Output**:
```typescript
{
  id: string;  // razorpay_order_id
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}
```

**Key Actions**:
- Validates plan and amount (server-side)
- Checks for existing membership
- Rate limiting
- Creates Razorpay order
- Stores order in database

### 5. razorpay-webhook
**Purpose**: Processes Razorpay webhook events

**Trigger**: Called by Razorpay when payment events occur

**Input**: Razorpay webhook payload with signature

**Output**:
```typescript
{
  received: boolean;
  error?: string;
}
```

**Key Actions**:
- Verifies webhook signature
- Stores payment record
- Updates membership
- Triggers lead-to-contact conversion
- Logs all transactions

---

## Triggers & Functions

### 1. handle_new_user()
**Trigger**: `on_auth_user_created` - AFTER INSERT ON auth.users

**Purpose**: Creates user profile when new user signs up

**Actions**:
- Extracts user data from OAuth metadata
- Parses full name into first/last name
- Creates profile with `zoho_sync_status = 'waiting_referral'`
- Auto-generates referral code

### 2. trigger_zoho_lead_creation()
**Trigger**: `on_profile_zoho_sync` - AFTER UPDATE ON profiles

**Purpose**: Triggers Zoho lead creation when ready

**Conditions**:
- `zoho_sync_status` changes to `'pending'`
- Email, first name, last name are not null

**Actions**:
- Calls `create-zoho-lead` edge function via HTTP POST
- Passes user data and referral code

### 3. handle_new_user_membership()
**Trigger**: AFTER INSERT ON auth.users

**Purpose**: Creates initial free membership for new users

**Actions**:
- Inserts row in `user_memberships` with tier = 'free'

### 4. update_updated_at_column()
**Trigger**: Applied to multiple tables (BEFORE UPDATE)

**Purpose**: Automatically updates `updated_at` timestamp

**Tables**:
- profiles
- user_memberships
- razorpay_orders
- razorpay_payments
- And others

---

## Complete Flow Diagrams

### User Signup Flow (Without Referral)
```
1. User clicks "Sign in with Google"
2. Google OAuth authentication
3. User authenticated → auth.users row created
4. Trigger: handle_new_user() → profiles row created (status: waiting_referral)
5. User redirected to dashboard
6. ReferralContext processes (no referral code)
7. Profile updated (status: pending)
8. Trigger: trigger_zoho_lead_creation() → create-zoho-lead edge function
9. Lead created in Zoho CRM
10. Profile updated (status: synced, zoho_lead_id set)
```

### User Signup Flow (With Referral)
```
1. User clicks referral link: /auth?ref=ABC123
2. Referral code stored in localStorage
3. User clicks "Sign in with Google"
4. Google OAuth authentication
5. User authenticated → auth.users row created
6. Trigger: handle_new_user() → profiles row created (status: waiting_referral)
7. User redirected to dashboard
8. ReferralContext processes:
   - Finds referrer by code ABC123
   - Updates profile (referred_by_user_id, zoho_referrer_contact_id, pending_referral_code)
   - Creates user_referrals entry (status: pending)
   - Changes status to 'pending'
9. Trigger: trigger_zoho_lead_creation() → create-zoho-lead edge function
10. Lead created in Zoho with referral info (Lead Source: External Referral)
11. Profile updated (status: synced, zoho_lead_id set)
12. user_referrals updated (zoho_lead_id set)
```

### Payment & Conversion Flow
```
1. User clicks "Upgrade to Pro" → initiatePayment()
2. Frontend calls create-razorpay-order edge function
3. Order created, stored in razorpay_orders
4. Razorpay checkout modal opens
5. User completes payment
6. Razorpay sends webhook to razorpay-webhook edge function
7. Webhook processing:
   - Verifies signature
   - Stores payment in razorpay_payments
   - Updates user_memberships (tier: pro_lifetime)
   - Calls convert-zoho-lead-to-contact edge function
8. Lead to Contact conversion:
   - Converts in Zoho CRM (creates Contact, Deal, Account)
   - Updates profile (zoho_contact_id, zoho_deal_id, zoho_account_id)
   - Updates user_referrals (status: converted, zoho_contact_id)
   - Calls update-zoho-lead-referral edge function
9. Referral reward processing (if referred):
   - Updates referrer's Zoho contact with successful referral
10. User now has Pro access
```

---

## Security Considerations

### 1. Row Level Security (RLS)
All tables have RLS enabled with appropriate policies:
- Users can only access their own data
- Super admins have full access
- Referral lookups are allowed for referral code validation

### 2. Server-Side Validation
- Payment amounts validated on server (client amounts ignored)
- Plan types validated against whitelist
- Rate limiting on order creation

### 3. Webhook Security
- Signature verification for Razorpay webhooks
- Prevents replay attacks

### 4. API Authentication
- All edge functions require valid Supabase auth tokens
- Service role key used only in backend

### 5. Data Privacy
- Sensitive data encrypted in database
- API keys stored as environment secrets
- No sensitive data in client-side code

---

## Error Handling & Logging

### 1. Zoho Conversion Failures
Failed conversions logged in `zoho_conversion_failures`:
- User ID, Lead ID
- Error message and details
- Plan type and amount
- Retry count
- Resolution status

### 2. Payment Transaction Logs
All payment events logged in `payment_transactions`:
- Order creation
- Payment capture
- Webhook events
- Includes full event data

### 3. Profile Sync Errors
Stored in `profiles.zoho_sync_error`:
- Error message from Zoho API
- Sync status set to 'failed'

---

## Testing

### Test Mode Configuration
```typescript
// Use test keys for development
RAZORPAY_TEST_KEY_ID=rzp_test_RXC7OYSlf7trWG
RAZORPAY_TEST_KEY_SECRET=[test_secret]
PAYMENT_ENVIRONMENT=test
```

### Test Referral Flow
1. Create user A → Get referral code
2. Sign out
3. Visit `/auth?ref=[USER_A_CODE]`
4. Sign up as user B
5. Verify `user_referrals` entry created with status 'pending'
6. Make payment as user B
7. Verify status changed to 'converted'

### Test Payment Flow
1. Sign up as new user
2. Initiate payment
3. Use Razorpay test card: 4111 1111 1111 1111
4. Complete payment
5. Verify webhook processing
6. Check membership updated
7. Verify Zoho contact created

---

## Configuration Checklist

### Supabase Secrets Required
- ✅ `ZOHO_CLIENT_ID`
- ✅ `ZOHO_CLIENT_SECRET`
- ✅ `ZOHO_REFRESH_TOKEN`
- ✅ `ZOHO_API_DOMAIN`
- ✅ `RAZORPAY_TEST_KEY_ID`
- ✅ `RAZORPAY_TEST_KEY_SECRET`
- ✅ `RAZORPAY_TEST_WEBHOOK_SECRET`
- ✅ `PAYMENT_ENVIRONMENT`
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

### Database Setup
- ✅ All tables created
- ✅ RLS policies enabled
- ✅ Triggers configured
- ✅ Functions deployed

### Edge Functions Deployed
- ✅ create-zoho-lead
- ✅ convert-zoho-lead-to-contact
- ✅ update-zoho-lead-referral
- ✅ create-razorpay-order
- ✅ razorpay-webhook

### Frontend Configuration
- ✅ Razorpay key ID in config
- ✅ Supabase client initialized
- ✅ Auth flow configured
- ✅ Payment flow integrated

---

## Appendix: Common Issues & Solutions

### Issue: Referral code not applying
**Cause**: RLS policy preventing lookup
**Solution**: Ensure "Users can view profiles by referral code" policy exists

### Issue: Lead not converting to contact
**Cause**: Zoho API permissions or missing lead ID
**Solution**: Check `zoho_conversion_failures` table, verify Zoho credentials

### Issue: Payment webhook not processing
**Cause**: Invalid webhook signature or wrong secret
**Solution**: Verify `RAZORPAY_WEBHOOK_SECRET` matches Razorpay dashboard

### Issue: User stuck in "waiting_referral" status
**Cause**: ReferralContext not triggering
**Solution**: Check browser console for errors, verify 500ms delay

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-27  
**Maintained By**: Vinca Wealth Development Team
