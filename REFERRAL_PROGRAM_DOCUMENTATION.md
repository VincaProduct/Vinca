# Vinca Wealth Referral Program - Technical Documentation

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Database Schema](#database-schema)
4. [Backend Implementation](#backend-implementation)
5. [Frontend Implementation](#frontend-implementation)
6. [Zoho CRM Integration](#zoho-crm-integration)
7. [User Flows](#user-flows)
8. [API Reference](#api-reference)
9. [Configuration & Setup](#configuration--setup)
10. [Testing Guidelines](#testing-guidelines)
11. [Troubleshooting](#troubleshooting)

---

## Overview

### Purpose
The referral program enables premium Vinca Wealth users to refer new users and track their referrals through both Supabase and Zoho CRM integration.

### Key Features
- **Unique Referral Codes**: Each premium user receives a unique 8-character referral code
- **Referral Tracking**: Complete tracking from signup through conversion
- **Zoho CRM Integration**: Automatic syncing of referral relationships to Zoho CRM
- **Status Management**: Three referral states (pending, verified, converted)
- **Premium-Only Access**: Only premium members can generate referral codes

### Technology Stack
- **Database**: Supabase PostgreSQL
- **Backend**: Supabase Edge Functions (Deno)
- **Frontend**: React + TypeScript
- **CRM**: Zoho CRM API v8
- **Authentication**: Supabase Auth

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     REFERRAL PROGRAM FLOW                     │
└─────────────────────────────────────────────────────────────┘

User A (Premium) ──> Generates Referral Code (8 chars)
                │
                ├──> Stored in profiles.referral_code
                │
                └──> Shares: example.com/auth?ref=A7X9K2M5
                              │
                              ▼
                     User B Clicks Link
                              │
                              ▼
                     Signs up with Google OAuth
                              │
                              ├──> handle_new_user() trigger
                              │    - Finds referrer by code
                              │    - Sets referred_by_user_id
                              │
                              ├──> trigger_zoho_lead_creation()
                              │    - Passes referralCode
                              │
                              ├──> create-zoho-lead edge function
                              │    - Creates Lead in Zoho
                              │    - Sets Referral_Contact field
                              │    - Creates user_referrals record
                              │
                              └──> Status: 'pending'
                                        │
                                        ▼
                              User B Buys Premium
                                        │
                                        ├──> Razorpay webhook
                                        │
                                        ├──> convert-zoho-lead-to-contact
                                        │    - Generates User B's code
                                        │    - Converts Lead → Contact
                                        │    - Preserves Referral_Contact
                                        │
                                        └──> Status: 'converted'
```

---

## Database Schema

### 1. profiles Table (Modified)

```sql
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS zoho_referrer_contact_id TEXT;
```

#### New Columns
| Column | Type | Description |
|--------|------|-------------|
| `referral_code` | TEXT (UNIQUE) | User's unique 8-char referral code (generated on premium upgrade) |
| `referred_by_user_id` | UUID | Foreign key to auth.users - the user who referred them |
| `zoho_referrer_contact_id` | TEXT | Zoho Contact ID of the referrer (for API calls) |

#### Indexes
```sql
CREATE INDEX idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX idx_profiles_referred_by ON public.profiles(referred_by_user_id);
```

### 2. user_referrals Table (New)

```sql
CREATE TABLE public.user_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_code_used TEXT,
  referral_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'converted')),
  zoho_lead_id TEXT,
  zoho_contact_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### Schema Details
| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | NO | Primary key |
| `user_id` | UUID | NO | The referred user |
| `referred_by_user_id` | UUID | YES | The user who made the referral |
| `referral_code_used` | TEXT | YES | The referral code used during signup |
| `referral_date` | TIMESTAMP | NO | When the referral was created |
| `status` | TEXT | NO | Current status: pending/verified/converted |
| `zoho_lead_id` | TEXT | YES | Zoho Lead ID (when Lead is created) |
| `zoho_contact_id` | TEXT | YES | Zoho Contact ID (when converted to premium) |
| `created_at` | TIMESTAMP | NO | Record creation timestamp |
| `updated_at` | TIMESTAMP | NO | Last update timestamp |

#### Status Lifecycle
1. **pending**: User signed up with referral code (Lead created in Zoho)
2. **verified**: (Reserved for future use)
3. **converted**: User became premium (Lead converted to Contact in Zoho)

#### Indexes
```sql
CREATE INDEX idx_user_referrals_user_id ON user_referrals(user_id);
CREATE INDEX idx_user_referrals_referred_by ON user_referrals(referred_by_user_id);
CREATE INDEX idx_user_referrals_code ON user_referrals(referral_code_used);
```

### 3. Row-Level Security (RLS) Policies

```sql
-- user_referrals RLS
ALTER TABLE user_referrals ENABLE ROW LEVEL SECURITY;

-- Users can view their own referrals (as the referred user)
CREATE POLICY "Users can view their own referrals"
  ON user_referrals FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view referrals they made (as the referrer)
CREATE POLICY "Users can view referrals they made"
  ON user_referrals FOR SELECT
  USING (auth.uid() = referred_by_user_id);

-- Users can insert their own referral records
CREATE POLICY "Users can insert their own referrals"
  ON user_referrals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Super admins can view all referrals
CREATE POLICY "Super admins can view all referrals"
  ON user_referrals FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'::app_role));
```

---

## Backend Implementation

### 1. Database Triggers

#### A. handle_new_user() - Modified

**Location**: PostgreSQL Function  
**Trigger**: AFTER INSERT ON auth.users

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public 
AS $$
DECLARE
  full_name_value TEXT;
  space_position INTEGER;
  referral_code_value TEXT;
  referrer_user_id UUID;
BEGIN
  full_name_value := NEW.raw_user_meta_data->>'full_name';
  referral_code_value := NEW.raw_user_meta_data->>'referral_code';
  
  -- Insert profile logic
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (NEW.id, NEW.email, full_name_value, now(), now())
  ON CONFLICT (id) DO NOTHING;
  
  -- NEW: Store referral relationship if code provided
  IF referral_code_value IS NOT NULL AND referral_code_value != '' THEN
    SELECT id INTO referrer_user_id 
    FROM public.profiles 
    WHERE referral_code = referral_code_value 
    LIMIT 1;
    
    IF referrer_user_id IS NOT NULL THEN
      UPDATE public.profiles 
      SET referred_by_user_id = referrer_user_id
      WHERE id = NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;
```

**Key Changes**:
- Extracts `referral_code` from user metadata
- Finds referrer by referral code
- Updates new user's profile with `referred_by_user_id`

#### B. trigger_zoho_lead_creation() - Modified

**Location**: PostgreSQL Function  
**Trigger**: AFTER INSERT/UPDATE ON profiles

```sql
CREATE OR REPLACE FUNCTION public.trigger_zoho_lead_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  request_id BIGINT;
  payload JSONB;
  referrer_code TEXT;
BEGIN
  -- Only trigger for pending status
  IF NEW.email IS NOT NULL 
     AND NEW.first_name IS NOT NULL 
     AND NEW.last_name IS NOT NULL 
     AND NEW.zoho_sync_status = 'pending' THEN
    
    -- NEW: Get referral code if user was referred
    IF NEW.referred_by_user_id IS NOT NULL THEN
      SELECT referral_code INTO referrer_code
      FROM profiles
      WHERE id = NEW.referred_by_user_id;
    END IF;
    
    payload := jsonb_build_object(
      'userId', NEW.id,
      'email', NEW.email,
      'firstName', NEW.first_name,
      'lastName', NEW.last_name,
      'fullName', NEW.full_name,
      'company', NEW.company,
      'phone', NEW.phone,
      'referralCode', referrer_code  -- NEW: Pass referral code
    );
    
    -- Call edge function
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
$function$;
```

**Key Changes**:
- Retrieves referrer's referral code from profiles
- Includes `referralCode` in payload to edge function

### 2. Edge Functions

#### A. create-zoho-lead (Modified)

**File**: `supabase/functions/create-zoho-lead/index.ts`

##### Interface Update
```typescript
interface LeadData {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  company?: string;
  phone?: string;
  referralCode?: string;  // NEW
}
```

##### Referral Processing Logic
```typescript
// Check if user was referred
let referrerContactId: string | null = null;

if (referralCode) {
  console.log('Referral code provided:', referralCode);
  
  // Find referrer by referral code
  const { data: referrerProfile } = await supabase
    .from('profiles')
    .select('id, zoho_contact_id, zoho_lead_id, first_name, last_name')
    .eq('referral_code', referralCode)
    .maybeSingle();
  
  if (referrerProfile) {
    // Prefer zoho_contact_id (premium users), fallback to zoho_lead_id
    referrerContactId = referrerProfile.zoho_contact_id || referrerProfile.zoho_lead_id;
    
    console.log('Found referrer:', {
      referrerId: referrerProfile.id,
      zohoId: referrerContactId,
      name: `${referrerProfile.first_name} ${referrerProfile.last_name}`
    });
    
    // Store referral relationship in profiles
    await supabase
      .from('profiles')
      .update({
        referred_by_user_id: referrerProfile.id,
        zoho_referrer_contact_id: referrerProfile.zoho_contact_id
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
```

##### Updated Zoho Payload
```typescript
const leadPayload = {
  data: [
    {
      Last_Name: finalLastName,
      First_Name: finalFirstName,
      Email: email,
      Company: company || 'Customer',
      Phone: phone || null,
      Lead_Source: referrerContactId ? 'External Referral' : 'Google Signup',  // NEW
      Description: `Signed up via Google OAuth on ${currentDate}${referrerContactId ? ' (Referred)' : ''}`,
      ...(referrerContactId && { Referral_Contact: referrerContactId })  // NEW
    },
  ],
};
```

##### Post-Creation Update
```typescript
// Update referral tracking with zoho_lead_id
if (referralCode) {
  await supabase
    .from('user_referrals')
    .update({ zoho_lead_id: leadId })
    .eq('user_id', userId);
}
```

**Key Features**:
- Validates referral code against profiles table
- Populates Zoho's `Referral_Contact` lookup field
- Creates user_referrals tracking record with status 'pending'
- Updates profiles with referrer information

#### B. convert-zoho-lead-to-contact (Modified)

**File**: `supabase/functions/convert-zoho-lead-to-contact/index.ts`

##### Extended Profile Query
```typescript
const { data: profile } = await supabaseClient
  .from('profiles')
  .select('id, email, first_name, last_name, zoho_lead_id, zoho_contact_id, referral_code, zoho_referrer_contact_id')
  .eq('id', userId)
  .single();
```

##### Referral Code Generation
```typescript
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
```

**Code Format**: First 8 characters of user UUID without hyphens, uppercase
- Example UUID: `a7e9k2m5-b3c4-...` → Code: `A7E9K2M5`

##### Direct Contact Creation (with Referral)
```typescript
const contactData = {
  data: [{
    First_Name: profile.first_name || '',
    Last_Name: profile.last_name || 'Customer',
    Email: profile.email,
    Contact_Status: 'Active',
    Lead_Source: profile.zoho_referrer_contact_id ? 'External Referral' : 'Google Signup',  // NEW
    Description: `Premium user - ${planName} (₹${planAmount / 100})`,
    ...(profile.zoho_referrer_contact_id && { 
      Referral_Contact: profile.zoho_referrer_contact_id  // NEW
    })
  }]
};
```

##### Referral Tracking Update
```typescript
// Update referral tracking status to 'converted'
await supabaseClient
  .from('user_referrals')
  .update({ 
    status: 'converted',
    zoho_contact_id: newContactId 
  })
  .eq('user_id', userId);
```

**Key Features**:
- Generates unique referral code for new premium users
- Maintains referral relationship during Lead → Contact conversion
- Updates user_referrals status from 'pending' to 'converted'
- Links new Contact to referrer via Zoho's `Referral_Contact` field

---

## Frontend Implementation

### 1. Hooks

#### useReferrals Hook

**File**: `src/hooks/useReferrals.ts`

```typescript
interface ReferralStats {
  referralCode: string | null;
  totalReferrals: number;
  pendingReferrals: number;
  convertedReferrals: number;
  referrals: Array<{
    id: string;
    status: string;
    created_at: string;
  }>;
}

export const useReferrals = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);

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

      // Calculate stats
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
      setLoading(false);
    };

    fetchReferralStats();
  }, [user]);

  return { stats, loading };
};
```

### 2. Components

#### ReferralCard Component

**File**: `src/components/referral/ReferralCard.tsx`

```typescript
interface ReferralCardProps {
  referralCode: string;
  totalReferrals: number;
  pendingReferrals: number;
  convertedReferrals: number;
}

export const ReferralCard = ({ referralCode, totalReferrals, pendingReferrals, convertedReferrals }: ReferralCardProps) => {
  const referralLink = `${window.location.origin}/auth?ref=${referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    // Show toast notification
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Join Vinca Wealth',
        text: `Join me on Vinca Wealth! Use code: ${referralCode}`,
        url: referralLink,
      });
    }
  };

  return (
    <div className="referral-card">
      <h3>Your Referral Code</h3>
      <div className="referral-code-badge">{referralCode}</div>
      <div className="stats-grid">
        <div>Total Referrals: {totalReferrals}</div>
        <div>Pending: {pendingReferrals}</div>
        <div>Converted: {convertedReferrals}</div>
      </div>
      <button onClick={handleCopyLink}>Copy Link</button>
      <button onClick={handleShare}>Share</button>
      {/* Additional UI elements */}
    </div>
  );
};
```

**Features**:
- Displays referral code as badge
- Shows stats grid (Total, Pending, Converted)
- Copy-to-clipboard functionality
- Native share API support
- Responsive design

#### ReferFriend Page

**File**: `src/pages/dashboard/ReferFriend.tsx`

```typescript
const ReferFriend = () => {
  const { stats, loading } = useReferrals();
  const { membership, loading: membershipLoading } = useMembership();

  // Premium-only check
  const isPremium = membership?.tier === 'premium';

  if (!isPremium) {
    return <Alert>Referral program available for premium members only</Alert>;
  }

  if (!stats?.referralCode) {
    return <Alert>Your referral code is being generated...</Alert>;
  }

  return (
    <div>
      <ReferralCard {...stats} />
      {/* Referral History */}
    </div>
  );
};
```

**Access Control**:
- Premium membership required
- Checks for valid referral code
- Shows loading states
- Displays referral history

### 3. Context Provider

#### ReferralContext

**File**: `src/contexts/ReferralContext.tsx`

```typescript
export const ReferralProvider = ({ children }) => {
  const { user } = useAuth();

  useEffect(() => {
    const processReferralCode = async () => {
      if (!user) return;

      // Check for pending referral code from OAuth redirect
      const pendingReferralCode = localStorage.getItem('pending_referral_code');
      
      if (pendingReferralCode) {
        // Find referrer
        const { data: referrerProfile } = await supabase
          .from('profiles')
          .select('id, zoho_contact_id')
          .eq('referral_code', pendingReferralCode)
          .maybeSingle();

        if (referrerProfile) {
          // Update current user's profile
          await supabase
            .from('profiles')
            .update({
              referred_by_user_id: referrerProfile.id,
              zoho_referrer_contact_id: referrerProfile.zoho_contact_id,
            })
            .eq('id', user.id);

          // Create referral tracking record
          await supabase
            .from('user_referrals')
            .insert({
              user_id: user.id,
              referred_by_user_id: referrerProfile.id,
              referral_code_used: pendingReferralCode,
              status: 'pending',
            });
        }

        // Clear pending code
        localStorage.removeItem('pending_referral_code');
      }
    };

    processReferralCode();
  }, [user]);

  return <ReferralContext.Provider value={{}}>{children}</ReferralContext.Provider>;
};
```

**Purpose**:
- Handles OAuth redirect flow
- Processes pending referral codes after Google signin
- Creates referral relationships post-authentication

### 4. Auth Page Integration

**File**: `src/components/auth/AuthPage.tsx`

```typescript
const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const [referralCode, setReferralCode] = useState('');

  // Check URL for referral code
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      toast({
        title: 'Referral code applied!',
        description: `Signing up with: ${refCode}`,
      });
    }
  }, [searchParams]);

  const handleGoogleSignIn = async () => {
    // Store referral code for post-OAuth processing
    if (referralCode) {
      localStorage.setItem('pending_referral_code', referralCode);
    }
    await signInWithGoogle();
  };

  // ... rest of component
};
```

**Features**:
- Detects `?ref=CODE` query parameter
- Stores referral code in localStorage (for OAuth flow)
- Shows confirmation toast
- Passes code through OAuth redirect

---

## Zoho CRM Integration

### 1. Custom Fields

#### Leads Module

##### Referral_Contact (Existing)
- **Field Type**: Lookup
- **API Name**: `Referral_Contact`
- **Target Module**: Contacts
- **Purpose**: Links Lead to the Contact who referred them
- **Created**: 2024-12-14
- **Related List Name**: Referred_Leads

**Configuration**:
```json
{
  "field_label": "Referral Contact",
  "api_name": "Referral_Contact",
  "data_type": "lookup",
  "custom_field": true,
  "lookup": {
    "display_label": "Referred Leads",
    "api_name": "Referred_Leads",
    "module": {
      "api_name": "Contacts",
      "id": "81297000000000039"
    }
  }
}
```

##### Lead_Source (Standard Field)
- **Field Type**: Picklist
- **Values**: 
  - "External Referral" (used for referred leads)
  - "Google Signup" (default)
  - Advertisement, Cold Call, etc.

#### Contacts Module

##### Referral_Contact (Inherited)
- Automatically preserved when Lead converts to Contact
- Maintains relationship to referring Contact

##### Lead_Source (Inherited)
- Carries over from Lead during conversion
- Preserved as "External Referral"

### 2. API Operations

#### Create Lead with Referral

**Endpoint**: `POST /crm/v8/Leads`

```json
{
  "data": [{
    "Last_Name": "Doe",
    "First_Name": "John",
    "Email": "john@example.com",
    "Company": "Test Inc",
    "Lead_Source": "External Referral",
    "Referral_Contact": "81297000011213001"
  }]
}
```

**Fields**:
- `Lead_Source`: Set to "External Referral"
- `Referral_Contact`: Zoho ID of referring Contact (or Lead as fallback)

#### Convert Lead to Contact

**Endpoint**: `POST /crm/v8/Leads/{lead_id}/actions/convert`

```json
{
  "data": [{
    "overwrite": false,
    "notify_lead_owner": true,
    "Contacts": {
      "Contact_Status": "Active"
    },
    "Deals": {
      "Deal_Name": "John Doe - Premium Pro",
      "Stage": "Closed Won",
      "Amount": 25000
    }
  }]
}
```

**Automatic Behavior**:
- `Referral_Contact` field is **automatically preserved**
- `Lead_Source` field carries over to Contact
- No manual referral data transfer needed

#### Create Contact Directly (for users without Lead)

**Endpoint**: `POST /crm/v8/Contacts`

```json
{
  "data": [{
    "First_Name": "John",
    "Last_Name": "Doe",
    "Email": "john@example.com",
    "Contact_Status": "Active",
    "Lead_Source": "External Referral",
    "Referral_Contact": "81297000011213001"
  }]
}
```

### 3. Zoho Reporting

#### View Referrals in Zoho

**Option 1: Contact Record**
1. Open any Contact record
2. Scroll to "Referred Leads" related list
3. See all Leads/Contacts referred by this person

**Option 2: Reports**
1. Create custom report on Leads or Contacts
2. Filter by `Lead_Source` = "External Referral"
3. Group by `Referral_Contact` to see top referrers

**Option 3: Dashboard Widgets**
- Referral count by Contact
- Conversion rate (Leads → Contacts with referrals)
- Top referrers leaderboard

---

## User Flows

### Flow 1: Premium User Generates Referral Code

```
1. User purchases premium membership
   ↓
2. Razorpay webhook triggers convert-zoho-lead-to-contact
   ↓
3. Edge function generates referral code:
   - Take user UUID: a7e9k2m5-b3c4-d5e6-f7g8-h9i0j1k2l3m4
   - Remove hyphens: a7e9k2m5b3c4d5e6f7g8h9i0j1k2l3m4
   - Take first 8 chars: a7e9k2m5
   - Uppercase: A7E9K2M5
   ↓
4. Store in profiles.referral_code
   ↓
5. User can access /dashboard/refer to see code
```

### Flow 2: New User Signs Up with Referral

```
1. User B clicks: example.com/auth?ref=A7E9K2M5
   ↓
2. AuthPage detects ?ref parameter
   ↓
3. Shows toast: "Referral code applied: A7E9K2M5"
   ↓
4. User clicks "Continue with Google"
   ↓
5. AuthPage stores code: localStorage.setItem('pending_referral_code', 'A7E9K2M5')
   ↓
6. OAuth redirect → User returns after Google auth
   ↓
7. ReferralContext.useEffect() triggers:
   - Reads pending_referral_code from localStorage
   - Finds referrer by code in profiles table
   - Updates new user's profile.referred_by_user_id
   - Creates user_referrals record (status: 'pending')
   - Clears localStorage
   ↓
8. handle_new_user() trigger fires:
   - Creates profile with referral info
   ↓
9. trigger_zoho_lead_creation() trigger fires:
   - Passes referralCode to edge function
   ↓
10. create-zoho-lead edge function:
    - Finds referrer's zoho_contact_id
    - Creates Lead with:
      * Lead_Source: "External Referral"
      * Referral_Contact: referrer's Zoho ID
    - Updates user_referrals.zoho_lead_id
```

### Flow 3: Referred User Becomes Premium

```
1. User B purchases premium membership
   ↓
2. Razorpay webhook triggers convert-zoho-lead-to-contact
   ↓
3. Edge function:
   - Generates User B's referral code
   - Converts Lead → Contact in Zoho
   - Referral_Contact field automatically preserved
   - Updates user_referrals.status = 'converted'
   - Updates user_referrals.zoho_contact_id
   ↓
4. User A can now see User B in converted referrals
```

### Flow 4: User Views Referral Dashboard

```
1. Premium user navigates to /dashboard/refer
   ↓
2. ReferFriend page loads
   ↓
3. useReferrals hook fetches:
   - User's referral_code from profiles
   - All user_referrals where referred_by_user_id = user.id
   ↓
4. Calculates stats:
   - totalReferrals = referrals.length
   - pendingReferrals = count where status='pending'
   - convertedReferrals = count where status='converted'
   ↓
5. ReferralCard displays:
   - Referral code badge
   - Stats grid
   - Shareable link: example.com/auth?ref=CODE
   - Copy/Share buttons
   - How it works section
   ↓
6. Referral history shows individual referral records
```

---

## API Reference

### Supabase Tables

#### profiles
```typescript
interface Profile {
  id: UUID;
  email: string;
  referral_code: string | null;           // NEW
  referred_by_user_id: UUID | null;       // NEW
  zoho_referrer_contact_id: string | null; // NEW
  // ... other fields
}
```

#### user_referrals
```typescript
interface UserReferral {
  id: UUID;
  user_id: UUID;
  referred_by_user_id: UUID | null;
  referral_code_used: string | null;
  referral_date: Date;
  status: 'pending' | 'verified' | 'converted';
  zoho_lead_id: string | null;
  zoho_contact_id: string | null;
  created_at: Date;
  updated_at: Date;
}
```

### Edge Function Interfaces

#### create-zoho-lead
```typescript
// Request
interface LeadData {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  company?: string;
  phone?: string;
  referralCode?: string; // NEW
}

// Response (Success)
{
  success: true,
  leadId: string,
  message: string
}

// Response (Error)
{
  success: false,
  error: string
}
```

#### convert-zoho-lead-to-contact
```typescript
// Request
interface ConversionRequest {
  userId: string;
  planAmount: number;
  planName: string;
}

// Response (Success)
{
  success: true,
  contactId: string,
  accountId?: string,
  dealId?: string,
  directCreation?: boolean
}

// Response (Error)
{
  success: false,
  error: string
}
```

### Frontend Hooks

#### useReferrals
```typescript
interface ReferralStats {
  referralCode: string | null;
  totalReferrals: number;
  pendingReferrals: number;
  convertedReferrals: number;
  referrals: Array<{
    id: string;
    status: string;
    created_at: string;
  }>;
}

const useReferrals = (): {
  stats: ReferralStats | null;
  loading: boolean;
}
```

---

## Configuration & Setup

### 1. Supabase Configuration

#### Database Setup
```bash
# Run migration (already applied)
# Creates profiles columns, user_referrals table, RLS policies
# Updates triggers: handle_new_user, trigger_zoho_lead_creation
```

#### Edge Functions
```toml
# supabase/config.toml
project_id = "xmmyjphoaqazwlifehxs"

[functions.create-zoho-lead]
verify_jwt = false

[functions.convert-zoho-lead-to-contact]
verify_jwt = false
```

### 2. Zoho CRM Setup

#### Required Custom Fields
✅ **Already Exists**: `Referral_Contact` (Lookup field in Leads module)

#### Verify Configuration
1. Go to Zoho CRM → Settings → Modules → Leads
2. Find "Referral_Contact" field
3. Confirm:
   - Field Type: Lookup
   - Target Module: Contacts
   - API Name: `Referral_Contact`

### 3. Environment Variables

Required secrets in Supabase:
- `ZOHO_CLIENT_ID`
- `ZOHO_CLIENT_SECRET`
- `ZOHO_REFRESH_TOKEN`
- `ZOHO_API_DOMAIN` (e.g., https://www.zohoapis.in)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### 4. Frontend Configuration

#### App.tsx
```typescript
import { ReferralProvider } from '@/contexts/ReferralContext';

<AuthProvider>
  <ReferralProvider>
    <RazorpayProvider>
      {/* ... */}
    </RazorpayProvider>
  </ReferralProvider>
</AuthProvider>
```

---

## Testing Guidelines

### 1. Database Testing

#### Test Referral Code Generation
```sql
-- Create test premium user
INSERT INTO user_memberships (user_id, tier)
VALUES ('test-user-uuid', 'premium');

-- Check if referral code generated
SELECT referral_code FROM profiles WHERE id = 'test-user-uuid';
-- Expected: 8-char uppercase code
```

#### Test Referral Relationship
```sql
-- Simulate referral signup
UPDATE profiles 
SET referred_by_user_id = 'referrer-uuid',
    zoho_referrer_contact_id = 'zoho-contact-id'
WHERE id = 'new-user-uuid';

-- Verify user_referrals record
SELECT * FROM user_referrals WHERE user_id = 'new-user-uuid';
-- Expected: status='pending', referral_code_used populated
```

### 2. Edge Function Testing

#### Test create-zoho-lead with Referral
```bash
curl -X POST https://xmmyjphoaqazwlifehxs.supabase.co/functions/v1/create-zoho-lead \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-uuid",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "referralCode": "A7E9K2M5"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "leadId": "81297000012345678",
  "message": "Lead created and profile updated successfully"
}
```

**Verify in Zoho**:
- Lead should have `Lead_Source` = "External Referral"
- `Referral_Contact` should link to referrer

#### Test convert-zoho-lead-to-contact
```bash
curl -X POST https://xmmyjphoaqazwlifehxs.supabase.co/functions/v1/convert-zoho-lead-to-contact \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-uuid",
    "planAmount": 25000,
    "planName": "Premium Pro"
  }'
```

**Expected**:
- Referral code generated in profile
- user_referrals status updated to 'converted'

### 3. Frontend Testing

#### Test Referral Link Flow
1. Login as premium user
2. Navigate to /dashboard/refer
3. Verify referral code displayed
4. Copy referral link
5. Open in incognito: /auth?ref=CODE
6. Verify toast shows: "Referral code applied"
7. Sign up with Google
8. Check profiles table for referred_by_user_id
9. Check user_referrals for new record

#### Test Referral Stats
1. Create test data in user_referrals
2. Navigate to /dashboard/refer
3. Verify stats display correctly:
   - Total Referrals count
   - Pending count (status='pending')
   - Converted count (status='converted')

### 4. Integration Testing

#### End-to-End Referral Flow
```
Setup:
- User A: Premium member with referral code "A7E9K2M5"
- User B: New user (not registered)

Test Steps:
1. User A shares link: /auth?ref=A7E9K2M5
2. User B clicks link and signs up with Google
3. Verify in Supabase:
   - profiles.referred_by_user_id = User A's ID
   - user_referrals record exists (status='pending')
4. Verify in Zoho:
   - Lead created with Referral_Contact = User A's Contact ID
   - Lead_Source = "External Referral"
5. User B purchases premium
6. Verify in Supabase:
   - user_referrals.status = 'converted'
   - profiles.referral_code generated for User B
7. Verify in Zoho:
   - Contact created with preserved Referral_Contact
8. User A views dashboard:
   - Total Referrals = 1
   - Converted Referrals = 1
```

---

## Troubleshooting

### Common Issues

#### 1. Referral Code Not Generated

**Symptom**: Premium user's `profiles.referral_code` is NULL

**Causes**:
- convert-zoho-lead-to-contact not triggered
- Edge function error during code generation

**Solution**:
```sql
-- Manually generate code
UPDATE profiles
SET referral_code = UPPER(SUBSTRING(REPLACE(id::text, '-', ''), 1, 8))
WHERE id = 'user-uuid' AND referral_code IS NULL;
```

#### 2. Referral Not Tracked in Zoho

**Symptom**: Lead created without `Referral_Contact` field

**Causes**:
- Invalid referral code
- Referrer not in Zoho (no zoho_contact_id)
- Zoho custom field misconfigured

**Debug**:
```typescript
// Check edge function logs
supabase functions logs create-zoho-lead

// Verify referrer exists
SELECT id, zoho_contact_id, referral_code 
FROM profiles 
WHERE referral_code = 'A7E9K2M5';
```

#### 3. OAuth Referral Code Lost

**Symptom**: Referral code not applied after Google signin

**Causes**:
- localStorage cleared during OAuth
- ReferralContext not processing pending code

**Debug**:
```javascript
// Check localStorage after OAuth redirect
console.log(localStorage.getItem('pending_referral_code'));

// Check ReferralContext logs
// Should see: "Processing pending referral code: A7E9K2M5"
```

**Solution**:
- Ensure ReferralContext is mounted in App.tsx
- Verify ReferralProvider wraps AuthProvider

#### 4. Referral Stats Not Loading

**Symptom**: Dashboard shows "No referral code"

**Causes**:
- User not premium
- RLS policy blocking query
- Profile not fetched correctly

**Debug**:
```sql
-- Check membership
SELECT tier FROM user_memberships WHERE user_id = 'user-uuid';

-- Check referral code
SELECT referral_code FROM profiles WHERE id = 'user-uuid';

-- Test RLS policy
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims.sub TO 'user-uuid';
SELECT * FROM user_referrals WHERE referred_by_user_id = 'user-uuid';
```

#### 5. Duplicate Referral Records

**Symptom**: Multiple user_referrals for same user

**Causes**:
- ReferralContext running multiple times
- Trigger firing repeatedly

**Prevention**:
```sql
-- Add unique constraint
ALTER TABLE user_referrals 
ADD CONSTRAINT unique_user_referral 
UNIQUE (user_id);
```

### Error Messages

#### "Referral program available for premium members only"
- User needs to upgrade to premium tier
- Check `user_memberships.tier = 'premium'`

#### "Your referral code is being generated"
- Code generation in progress (should take <1 second)
- Refresh page
- Check edge function logs if persists

#### "Invalid referral code provided"
- Code doesn't exist in database
- Check for typos
- Verify referrer is premium user

### Monitoring

#### Key Metrics to Track
```sql
-- Total referrals
SELECT COUNT(*) FROM user_referrals;

-- Conversion rate
SELECT 
  COUNT(*) FILTER (WHERE status = 'converted') * 100.0 / COUNT(*) as conversion_rate
FROM user_referrals;

-- Top referrers
SELECT 
  p.email,
  COUNT(*) as referral_count
FROM user_referrals ur
JOIN profiles p ON ur.referred_by_user_id = p.id
GROUP BY p.email
ORDER BY referral_count DESC
LIMIT 10;

-- Recent referrals
SELECT 
  ur.created_at,
  ur.status,
  p.email as referrer_email
FROM user_referrals ur
JOIN profiles p ON ur.referred_by_user_id = p.id
ORDER BY ur.created_at DESC
LIMIT 20;
```

#### Edge Function Logs
```bash
# View create-zoho-lead logs
supabase functions logs create-zoho-lead --tail

# View convert-zoho-lead-to-contact logs
supabase functions logs convert-zoho-lead-to-contact --tail
```

---

## Future Enhancements

### Potential Features
1. **Reward System**: Implement incentives for successful referrals
2. **Email Notifications**: Notify referrers when someone signs up
3. **Referral Analytics Dashboard**: Advanced charts and trends
4. **Custom Referral Codes**: Allow users to create vanity codes
5. **Multi-tier Referrals**: Track referrals beyond first level
6. **Referral Campaigns**: Time-limited promotional campaigns
7. **API Endpoints**: Public API for referral data access

### Database Extensions
```sql
-- Rewards tracking
CREATE TABLE referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID REFERENCES user_referrals(id),
  reward_type TEXT,
  reward_amount INTEGER,
  awarded_at TIMESTAMP,
  claimed BOOLEAN DEFAULT false
);

-- Referral campaigns
CREATE TABLE referral_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  bonus_multiplier DECIMAL,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  active BOOLEAN DEFAULT true
);
```

---

## Appendix

### A. Code Reference Summary

#### Database
- **Modified Tables**: `profiles` (3 new columns)
- **New Tables**: `user_referrals`
- **Modified Triggers**: `handle_new_user`, `trigger_zoho_lead_creation`

#### Backend
- **Modified Edge Functions**: 
  - `create-zoho-lead` (+referral logic)
  - `convert-zoho-lead-to-contact` (+code generation)

#### Frontend
- **New Hooks**: `useReferrals`
- **New Components**: 
  - `ReferralCard`
  - `ReferralContext`
- **Modified Pages**:
  - `ReferFriend` (complete rewrite)
  - `AuthPage` (+referral code detection)

### B. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     DATA FLOW SUMMARY                          │
└─────────────────────────────────────────────────────────────┘

Referral Link Click
  ↓
URL Param (?ref=CODE)
  ↓
AuthPage (localStorage)
  ↓
Google OAuth Redirect
  ↓
ReferralContext (processes code)
  ↓
profiles.referred_by_user_id ← Updated
user_referrals ← Created (status: pending)
  ↓
Trigger: handle_new_user
  ↓
Trigger: trigger_zoho_lead_creation
  ↓
Edge: create-zoho-lead
  ↓
Zoho Lead Created:
  - Referral_Contact ← Set
  - Lead_Source ← "External Referral"
  ↓
user_referrals.zoho_lead_id ← Updated
  ↓
[User Purchases Premium]
  ↓
Edge: convert-zoho-lead-to-contact
  ↓
profiles.referral_code ← Generated
user_referrals.status ← "converted"
  ↓
Zoho Contact Created:
  - Referral_Contact ← Preserved
  - Lead_Source ← Preserved
  ↓
Dashboard: /dashboard/refer
  ↓
ReferralCard displays stats
```

### C. Quick Reference Commands

```bash
# View database schema
psql -h db.xmmyjphoaqazwlifehxs.supabase.co -d postgres -c "\d profiles"
psql -h db.xmmyjphoaqazwlifehxs.supabase.co -d postgres -c "\d user_referrals"

# Check edge function logs
supabase functions logs create-zoho-lead --tail
supabase functions logs convert-zoho-lead-to-contact --tail

# Query referral stats
supabase db query "SELECT COUNT(*) FROM user_referrals WHERE status='converted'"

# Test referral code generation
curl -X POST https://xmmyjphoaqazwlifehxs.supabase.co/functions/v1/convert-zoho-lead-to-contact \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-uuid","planAmount":25000,"planName":"Premium Pro"}'
```

---

## Document Metadata

**Version**: 1.0  
**Last Updated**: 2025-01-26  
**Author**: Technical Team  
**Project**: Vinca Wealth Referral Program  
**Status**: Production Ready

**Change Log**:
- 2025-01-26: Initial documentation created
- Database schema implemented
- Edge functions updated
- Frontend components deployed
- Zoho integration verified

---

*End of Documentation*
