# Backend System Architecture Document

**Document Status**: Accurate (Code Analysis Based)  
**Date**: March 24, 2026  
**Purpose**: Technical foundation for product and CRM system design

---

## 1. System Architecture Overview

### 1.1 Technology Stack

```
┌─────────────────────────────────────────────────────────┐
│               FRONTEND (React + TypeScript)              │
│          (Vite, TanStack Query, React Router)            │
└────────────────┬────────────────────────────────────────┘
                 │ HTTP/REST Calls
                 ▼
┌─────────────────────────────────────────────────────────┐
│         SUPABASE (Backend Infrastructure)                │
│  ┌────────────────────────────────────────────────────┐ │
│  │  PostgreSQL Database (All persistent data)         │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Supabase Auth (JWT-based authentication)          │ │
│  │  - Google OAuth                                    │ │
│  │  - Email/Password                                 │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Supabase Edge Functions (Backend Logic)           │ │
│  │  - create-razorpay-order                          │ │
│  │  - razorpay-webhook                               │ │
│  │  - create-zoho-contact                            │ │
│  │  - update-zoho-contact-referral                   │ │
│  │  - update-zoho-contact-user-type                  │ │
│  └────────────────────────────────────────────────────┘ │
└────────┬─────────────────────────────────┬──────────────┘
         │                                 │
         ▼                                 ▼
   ┌──────────────┐            ┌──────────────────┐
   │  Razorpay    │            │  Zoho CRM        │
   │  (Payments)  │            │  (Lead/Contact)  │
   └──────────────┘            └──────────────────┘
```

### 1.2 Component Architecture

**Frontend Components**:
- **Pages**: Public (landing, blog, auth), Dashboard (tools, settings), FFR modules
- **Contexts**: 
  - `AuthContext` – User authentication state & methods
  - `FinancialPlanningContext` – FFR calculation engine + results storage
  - `ReferralContext` – Referral code processing on login
  - `RazorpayContext` – Payment script loading
- **Hooks**: 
  - `useAuth()` – Access to user & session
  - `useFFR()` – Fetch/manage FFR data from DB
  - `useFinancialPlanning()` – Access to calculator context
  - `useRazorpayPayment()` – Payment initiation
  - `useReferrals()` – Referral statistics

**Backend (Server-Side)**:
- **Supabase Edge Functions** (Deno-based):
  - Order creation & security validation
  - Webhook processing (no signature verification yet)
  - CRM contact sync
  - Referral tracking updates
- **Database**: PostgreSQL with 15+ tables
- **External APIs**: Razorpay, Zoho

### 1.3 Data Flow Architecture

**Client-Server Interaction Pattern**:
```
Frontend (React)
    ↓
Contexts (State Management)
    ↓
API Calls (Supabase Client)
    ↓
Edge Functions (Orchestration)
    ↓
Database (Persistence) + External APIs
    ↓
Response back to Frontend
    ↓
Local State Update + localStorage
```

---

## 2. FFR (Financial Freedom Readiness) Data Flow

### 2.1 Complete FFR User Journey

```
Step 1: User Inputs Financial Data
  ├─ Location: TimelineCalculatorForm component
  ├─ Data Captured:
  │  ├─ age (current)
  │  ├─ lifeExpectancy
  │  ├─ initialPortfolioValue
  │  ├─ sipAmount (monthly)
  │  ├─ yearsForSIP
  │  ├─ returnDuringSIPAndWaiting (% p.a.)
  │  ├─ growthInSIP (% p.a.)
  │  ├─ waitingYearsBeforeSWP
  │  ├─ currentMonthlyExpenses
  │  ├─ monthlyIncome
  │  ├─ inflation (% p.a.)
  │  ├─ returnDuringSWP (% p.a.)
  │  └─ growthInSWP (% p.a.)
  └─ Storage: Local state (FinancialPlanningContext)

Step 2: FFR Calculations (Client-Side Engine)
  ├─ File: src/utils/calculatorUtils.ts
  ├─ Audience: FinancialPlanningContext.setInputs()
  ├─ Calculation Types:
  │  ├─ requiredCorpus (inflation-adjusted)
  │  ├─ requiredMonthlySIP (binary search algorithm)
  │  ├─ canAchieveGoal (boolean)
  │  ├─ yearlyProjections (25+ year simulation)
  │  ├─ corpusDepletionAge (when money runs out)
  │  └─ swpStartAge (when withdrawals begin)
  ├─ Math Engine: FV() formula (Excel-compatible)
  ├─ Simulation: Monthly compounding for 65+ years
  └─ Output: CalculationResults

Step 3: Financial Planning State Updated
  ├─ Location: FinancialPlanningContext
  ├─ State Updates:
  │  ├─ inputs: CalculatorInputs
  │  ├─ results: CalculationResults
  │  ├─ projections: DetailedProjection[] (yearly)
  │  ├─ lifestyleData: Optional lifestyle analysis
  │  └─ healthStressData: Optional health cost impact
  └─ Persistence: localStorage (STORAGE_KEY: 'financial_planning_state')

Step 4: FFR Scoring Engine Triggers
  ├─ File: src/utils/ffrScoring.ts
  ├─ When: User loads FFR page or calculator updates
  ├─ Scoring Categories:
  │  ├─ Foundation Score (0-40)
  │  │  └─ Input: ffr_foundations_checklist
  │  │  └─ Calculation: 6 checklist items × (40/6) per item
  │  ├─ Habit Score (0-25)
  │  │  ├─ Derives: sipReliability (actual SIP vs required)
  │  │  ├─ Derives: savingConsistency (lifecycle readiness)
  │  │  └─ Formula: (sipReliability/100)*15 + (consistencyPoints/100)*10
  │  ├─ Literacy Score (0-20)
  │  │  ├─ Input: ffr_user_actions (action_type='education_opened'|'document_viewed')
  │  │  └─ Sum: points_earned capped at 20
  │  ├─ Opportunity Score (0-10)
  │  │  ├─ Input: ffr_user_actions (action_type='handoff_clicked')
  │  │  └─ Sum: points_earned capped at 10
  │  └─ Decumulation Score (0-5)
  │     ├─ Input: ffr_user_actions (metadata.category='decumulation')
  │     └─ Sum: points_earned capped at 5
  └─ Total: BASE = 100 points (conservative-20, optimistic+15)

Step 5: FFR Scores Persisted to Database
  ├─ Database Table: ffr_user_progress
  ├─ Trigger Function: useFFR() hook in UnifiedFFRPage
  ├─ Data Saved:
  │  ├─ foundation_score, habit_score, literacy_score, opportunity_score, decumulation_score
  │  ├─ total_score_conservative, total_score_base, total_score_optimistic
  │  ├─ last_assessment_date
  │  └─ updated_at (system timestamp)
  ├─ Upsert Logic: If record exists → UPDATE; else → INSERT
  └─ Associated Data Also Saved:
      ├─ user_calculations (inputs + results)
      └─ ffr_user_progress (one row per user)

Step 6: FFR Checklist Tracked
  ├─ Database Table: ffr_foundations_checklist
  ├─ Checkboxes Tracked:
  │  ├─ kyc_refresh (Know Your Customer update)
  │  ├─ nomination_updated (Beneficiary nomination)
  │  ├─ emergency_fund_baseline (6-month expenses saved)
  │  ├─ sip_mandate_active (SIP set up)
  │  ├─ document_vault_setup (Important docs stored)
  │  ├─ insurance_evidence (Insurance proof)
  │  └─ freedom_gain_points (Achievement points)
  └─ Updates Via: UI toggles → Supabase update

Step 7: User Actions Logged
  ├─ Database Table: ffr_user_actions
  ├─ Tracked Actions:
  │  ├─ education_opened (video/article viewed)
  │  ├─ document_viewed (PDF accessed)
  │  ├─ handoff_clicked (Opportunity selected)
  │  ├─ checklist_item_completed
  │  └─ custom_action_type (extensible)
  ├─ Data Saved:
  │  ├─ action_type (string)
  │  ├─ content_id (optional link to content)
  │  ├─ points_earned (reward value)
  │  ├─ metadata (JSON for extensibility)
  │  └─ created_at (timestamp)
  └─ Used For: Literacy, Opportunity, & Decumulation scoring

Step 8: FFR Results Displayed
  ├─ Location: UnifiedFFRPage → Multiple Tabs
  ├─ Tabs:
  │  ├─ Financial Readiness: Core FFR score + breakdown
  │  ├─ Timeline Calculator: Year-by-year projection table
  │  ├─ Lifestyle Planner: Expense scenario analysis
  │  └─ Health Stress: Medical cost impact simulation
  └─ User Sees:
      ├─ FFR Band (Getting Started / Developing / Good / Excellent)
      ├─ Detailed Breakdown (5 component scores)
      ├─ Next Steps (priority-ordered recommendations)
      ├─ Year-by-year Corpus projection
      └─ Gap-to-goal analysis
```

### 2.2 FFR Data Model (Database Schema)

**Table: ffr_user_progress**
```sql
id                              UUID (primary key)
user_id                         UUID (foreign key → auth.users)
foundation_score                INT (0-40)
habit_score                     INT (0-25)
literacy_score                  INT (0-20)
opportunity_score               INT (0-10)
decumulation_score              INT (0-5)
total_score_conservative        INT (0-100, scenario pessimistic)
total_score_base                INT (0-100, scenario base)
total_score_optimistic          INT (0-100, scenario optimistic)
last_assessment_date            TIMESTAMP
created_at                      TIMESTAMP
updated_at                      TIMESTAMP
```

**Table: ffr_foundations_checklist**
```sql
id                              UUID (primary key)
user_id                         UUID (foreign key)
kyc_refresh                     BOOLEAN (default: false)
nomination_updated              BOOLEAN (default: false)
emergency_fund_baseline         BOOLEAN (default: false)
sip_mandate_active              BOOLEAN (default: false)
document_vault_setup            BOOLEAN (default: false)
insurance_evidence              BOOLEAN (default: false)
freedom_gain_points             INT (cumulative achievement points)
last_updated                    TIMESTAMP
created_at                      TIMESTAMP
```

**Table: ffr_user_actions**
```sql
id                              UUID (primary key)
user_id                         UUID (foreign key)
action_type                     STRING (e.g., 'education_opened', 'handoff_clicked')
content_id                      UUID (optional, links to ffr_educational_content)
points_earned                   INT (reward value for this action)
metadata                        JSON (flexible extensible data)
created_at                      TIMESTAMP
```

**Table: ffr_educational_content**
```sql
id                              UUID (primary key)
title                           STRING
content_type                    ENUM ('video', 'article', 'document', 'explainer')
category                        STRING (e.g., 'lifestyle', 'decumulation', 'health')
description                     TEXT
difficulty_level                ENUM ('beginner', 'intermediate', 'advanced')
duration_seconds                INT
content_url                     URL
points_value                    INT (reward for completion)
is_active                       BOOLEAN (soft delete)
created_at                      TIMESTAMP
updated_at                      TIMESTAMP
```

**Table: ffr_opportunities**
```sql
id                              UUID (primary key)
lane                            STRING (e.g., 'insurance', 'tax', 'investment')
opportunity_name                STRING
trigger_conditions              JSON (when this opportunity becomes relevant)
educational_content             STRING (reference/link to content)
why_matters                     TEXT (importance explanation)
partner_handoff_url             URL (third-party integration endpoint)
eligibility_criteria            JSON (who qualifies)
seasonal_window                 JSON (when available)
is_active                       BOOLEAN
created_at                      TIMESTAMP
updated_at                      TIMESTAMP
```

**Table: user_calculations**
```sql
id                              UUID (primary key)
user_id                         UUID (foreign key)
calculation_type                STRING (e.g., 'ffr_planning', 'goal_projection')
inputs                          JSON (CalculatorInputs)
results                         JSON (CalculationResults)
created_at                      TIMESTAMP
updated_at                      TIMESTAMP
```

### 2.3 FFR Hook Implementation

**File**: `src/hooks/useFFR.ts`

```typescript
Key Functions:
├─ fetchFFRData()
│  ├─ Queries: ffr_user_progress, ffr_foundations_checklist, ffr_user_actions
│  ├─ If no progress exists: calculateAndUpdateScores() auto-triggered
│  └─ State: ffrProgress, checklist, actions
│
├─ calculateAndUpdateScores()
│  ├─ Calls: FFRScoringEngine methods for all 5 scores
│  ├─ Triggers: When financial data changes (SIP, corpus, goal status)
│  └─ Updates Supabase: Upsert ffr_user_progress
│
└─ Effect Watchers:
   └─ Re-calculates when: sipAmount, requiredMonthlySIP, canAchieveGoal, initialPortfolioValue
```

### 2.4 FFR Scoring Engine (FFRScoringEngine Class)

**File**: `src/utils/ffrScoring.ts`

```
FFRScoringEngine.deriveHabitMetrics(inputs, results)
  ├─ sipReliability = (userSIP / requiredSIP) × 100
  ├─ savingConsistency = points for:
  │  ├─ Has financial plan (30pts)
  │  ├─ Has active SIP (20pts)
  │  ├─ Sustainable through life expectancy (30pts)
  │  └─ Has existing portfolio (20pts)
  └─ Returns: {sipReliability, savingConsistency}

FFRScoringEngine.calculateFoundationScore(checklist)
  ├─ Counts: Number of TRUE items in 6-item checklist
  └─ Score = (completed / 6) × 40

FFRScoringEngine.calculateHabitScore(sipReliability, savingConsistency)
  ├─ Reliability contribution = (sipReliability / 100) × 15
  ├─ Consistency contribution = (savingConsistency / 100) × 10
  └─ Total = Reliability + Consistency (0-25 capped)

FFRScoringEngine.calculateLiteracyScore(actions)
  ├─ Filters: action_type = 'education_opened' | 'document_viewed'
  └─ Sum: points_earned (capped at 20)

FFRScoringEngine.calculateOpportunityScore(actions)
  ├─ Filters: action_type = 'handoff_clicked'
  └─ Sum: points_earned (capped at 10)

FFRScoringEngine.calculateDecumulationScore(actions)
  ├─ Filters: metadata.category = 'decumulation'
  └─ Sum: points_earned (capped at 5)

FFRScoringEngine.calculateTotalScores(all individual scores)
  ├─ baseTotal = sum of all 5 scores
  └─ Returns: {
       conservative: baseTotal - 15,
       base: baseTotal,
       optimistic: min(baseTotal + 15, 100)
     }
```

---

## 3. Data Storage & Models

### 3.1 Database Tables (Complete Inventory)

| Table Name | Purpose | Records Scope | Key Fields |
|------------|---------|---------------|-----------|
| **ffr_user_progress** | FFR scores & assessment | Per user (1 row) | foundation_score, habit_score, literacy_score, opportunity_score, decumulation_score, total_score_* |
| **ffr_foundations_checklist** | FFR checklist state | Per user (1 row) | kyc_refresh, nomination_updated, emergency_fund_baseline, sip_mandate_active, document_vault_setup, insurance_evidence |
| **ffr_user_actions** | User engagement events | Per action (many rows) | action_type, content_id, points_earned, metadata |
| **ffr_educational_content** | Content library | Admin-managed | title, content_type, category, difficulty_level, points_value |
| **ffr_opportunities** | Recommended actions | Admin-managed | lane, opportunity_name, trigger_conditions, eligibility_criteria |
| **user_calculations** | Financial planning inputs & results | Per calculation (many) | calculation_type, inputs (JSON), results (JSON) |
| **profiles** | User profile & CRM sync state | Per user (1 row) | first_name, last_name, email, phone, referral_code, zoho_contact_id, zoho_lead_id, zoho_sync_status |
| **user_memberships** | Subscription tier | Per user (1 row) | tier (free/premium/client), subscription_status, payment_date, razorpay_order_id |
| **user_referrals** | Referral relationships | Per referral | referred_by_user_id, referral_code_used, status (pending/converted), zoho_contact_id, zoho_lead_id |
| **razorpay_orders** | Payment orders | Per order | razorpay_order_id, amount, currency, plan_type, status, notes |
| **razorpay_payments** | Payment confirmations | Per payment | razorpay_payment_id, razorpay_order_id, amount, status, captured_at, method |
| **payment_transactions** | Webhook events audit log | Per event | event_type (payment.authorized, payment.captured), event_data, webhook_event_id |
| **blog_posts** | Blog content | Admin-managed | title, slug, content, author_id, category, published_at |
| **ctas** | Call-to-action templates | Admin-managed | headline, button_text, action_url, action_type (navigate_url, download_file, etc.) |
| **cta_placements** | CTA display rules | Per placement | cta_id, blog_post_id, placement_position (top, mid_article, bottom), active |
| **cta_analytics** | CTA interaction tracking | Per click | cta_id, event_type (clicked, viewed, converted), user_id, session_id |
| **consultation_bookings** | Meeting bookings | Per booking | user_id, consultation_type, preferred_date, preferred_time_slot, status |
| **user_achievements** | Achievement badges | Per achievement | achievement_type, points, unlocked_at |
| **user_roles** | Role-based access | Per assignment | user_id, role (super_admin, admin, user) |
| **authors** | Blog author profiles | Admin-managed | name, bio, image, title |
| **zoho_conversion_failures** | Failed CRM syncs | Per failure | user_id, error_message, plan_type, zoho_lead_id, retry_count, resolved |

### 3.2 Data Persistence Strategy

**What IS Stored in Database** ✓
```
✓ User authentication (Supabase Auth)
✓ User profiles (names, emails, contact info)
✓ FFR scores & checklist state
✓ User actions (activity log)
✓ Financial calculations (inputs + results)
✓ Payment records (orders, payments, webhooks)
✓ Referral relationships
✓ Membership tier & status
✓ Blog content & CTA rules
✓ CRM sync state (Zoho contact/lead IDs)
```

**What is NOT Stored, Why, & Where It Lives** ✗
```
✗ Session data → localStorage (token, temporary state)
✗ Financial projections (year-by-year) → Recalculated on demand (results recomputed from inputs)
✗ Real-time calculations → In-memory React state during calculator use
✗ Lifestyle analysis results → LocalStorage + session state (recalculated from base results)
✗ Health stress analysis → LocalStorage + session state (recalculated from base results)
✗ UI state (tab selection, accordion open/close) → React component state
✗ Temporary form data → React Hook Form state (before submission)
✗ Cache of fetched content → TanStack Query (React Query) memory cache
```

### 3.3 Data Relationships (Entity Relationship Diagram Logic)

```
auth.users (from Supabase Auth)
  │
  ├──→ profiles (1:1)
  │    └──→ user_referrals (1:many) — referred_by_user_id
  │    └──→ zoho_conversion_failures (1:many)
  │
  ├──→ ffr_user_progress (1:1)
  ├──→ ffr_foundations_checklist (1:1)
  ├──→ ffr_user_actions (1:many)
  │    └──→ ffr_educational_content (via content_id)
  │
  ├──→ user_calculations (1:many)
  ├──→ user_memberships (1:1)
  │    └──→ razorpay_payments (via payment_id)
  │
  ├──→ razorpay_orders (1:many)
  │    └──→ payment_transactions (via order_id)
  │    └──→ razorpay_payments (1:many, via order_id)
  │
  ├──→ user_achievements (1:many)
  ├──→ user_roles (1:many)
  └──→ consultation_bookings (1:many)

FFR Content (Admin-Managed):
  ffr_educational_content (1:many)
  ffr_opportunities (1:many)

Referral Tracking:
  user_referrals → profiles (referred_by_user_id)
               → zoho_contact_id / zoho_lead_id (external IDs)

Blog Publishing:
  blog_posts → authors (via author_id)
           → cta_placements (1:many)
  cta_placements → ctas (via cta_id)
  cta_analytics → blog_posts, ctas, users (tracking clicks)
```

---

## 4. Integration Points (Exact File Locations & Functions)

### 4.1 Payment Integration (Razorpay)

**Frontend Trigger**:
- **File**: [src/hooks/useRazorpayPayment.ts](src/hooks/useRazorpayPayment.ts)
- **Function**: `initiatePayment({ planType, amount, onSuccess, onFailure })`
- **Inputs**: 
  - `planType`: "pro_lifetime"
  - `amount`: Amount in paise (₹25,000 = 2500000 paise)
- **Flow**:
  1. Loads Razorpay checkout script
  2. Calls Supabase edge function: `create-razorpay-order`
  3. Initializes Razorpay checkout modal
  4. On success → backend webhook handles payment confirmation

**Backend Edge Function**:
- **File**: `supabase/functions/create-razorpay-order/index.ts`
- **Trigger**: Called from frontend via `supabase.functions.invoke("create-razorpay-order", { body })`
- **Security Checks**:
  - ✓ JWT verification (must be authenticated)
  - ✓ Server-side amount validation (prevents client-side tampering)
  - ✓ Rate limiting (max 3 orders per 5 minutes)
  - ✓ Membership check (prevents duplicate premium purchases)
- **Data Saved to DB**:
  - ✓ `razorpay_orders` table (order details)
  - ✓ Order status: "pending" → "authorized" → "captured"

**Webhook Handler**:
- **File**: `supabase/functions/razorpay-webhook/index.ts`
- **Triggers On**: Payment events from Razorpay:
  - `payment.authorized` – Payment authorized
  - `payment.captured` – Payment successful
  - `payment.failed` – Payment failed
- **Webhook Actions**:
  - ✓ Verifies Razorpay signature (SECURITY)
  - ✓ Logs as `payment_transactions` (audit trail)
  - ✓ Updates `razorpay_orders` status
  - ✓ Updates `razorpay_payments` record
  - ✓ On capture → Calls `update-zoho-contact-user-type` (CRM sync)
- **Duplicate Prevention**: Checks `webhook_event_id` to prevent reprocessing

**Data Model for Payment**:
```
razorpay_orders
├─ razorpay_order_id: String (Razorpay-generated ID)
├─ user_id: UUID (who made the payment)
├─ plan_type: String (must be validated server-side)
├─ amount: INT (in paise)
├─ status: String (pending, authorized, captured, failed)
└─ notes: JSON (metadata for tracking)

razorpay_payments
├─ razorpay_payment_id: String (proof of payment)
├─ razorpay_order_id: String (links to order)
├─ status: String (authorized, captured, failed)
├─ method: String (upi, card, netbanking, wallet)
├─ captured_at: TIMESTAMP (when money actually taken)
└─ razorpay_signature: String (webhook verification)

payment_transactions
├─ event_type: String (payment.authorized, payment.captured, etc.)
├─ event_data: JSON (full webhook payload)
├─ webhook_event_id: String (Razorpay event ID for deduplication)
└─ created_at: TIMESTAMP
```

### 4.2 CRM Integration (Zoho)

**Trigger 1: User Signup/Referral Processing**
- **File**: [src/contexts/ReferralContext.tsx](src/contexts/ReferralContext.tsx)
- **When**: User logs in (OAuth redirect)
- **Actions**:
  1. Checks for referral code in URL or localStorage
  2. If valid referral found → Links referred_by_user_id in profiles
  3. Updates `zoho_sync_status` to "pending" (triggers Zoho sync)
- **Data Saved**:
  - ✓ `profiles.referred_by_user_id` (internal referral link)
  - ✓ `profiles.zoho_sync_status` = "pending"
  - ✓ `user_referrals` record (tracking)

**Trigger 2: Create Zoho Contact**
- **File**: `supabase/functions/create-zoho-contact/index.ts`
- **Called By**: Backend job (TBD timing) when `profiles.zoho_sync_status = "pending"`
- **Data Sent to Zoho**:
  - ✓ First name, last name, email, phone
  - ✓ Referral source (if referred)
  - ✓ Custom field: referrer_contact_id
- **Zoho Response Stored**:
  - ✓ `profiles.zoho_contact_id` (Zoho contact record ID)
  - ✓ `profiles.zoho_lead_id` (Zoho lead record ID)
  - ✓ `profiles.zoho_sync_status` = "synced"
- **Error Handling**:
  - On failure → `zoho_conversion_failures` table (retry mechanism)

**Trigger 3: Update Contact on Payment**
- **File**: `supabase/functions/update-zoho-contact-user-type/index.ts`
- **Called By**: `razorpay-webhook` when payment is captured
- **Action**: Changes Zoho contact type from "Lead" to "Customer"
- **Data Updated in Zoho**:
  - ✓ Contact -> Custom Field: "Plan Type" = plan_type
  - ✓ Contact -> Custom Field: "Payment Amount" = amount
  - ✓ Contact -> Status = "Customer"

**Trigger 4: Update Referral Info**
- **File**: `supabase/functions/update-zoho-contact-referral/index.ts`
- **Purpose**: Update Zoho when referral is converted (payment received)
- **Data Updated**:
  - ✓ Referrer's contact: "Referral Count" + 1
  - ✓ Referrer's contact: Add referred user to custom list
  - ✓ Referred user's contact: Link referrer

**CRM Data Model** (stored in profiles):
```
profiles
├─ zoho_sync_status: String (waiting_referral, pending, synced, error)
├─ zoho_contact_id: UUID (Zoho contact record ID)
├─ zoho_lead_id: UUID (Zoho lead record ID)
├─ zoho_account_id: UUID (Zoho account/company ID)
├─ zoho_deal_id: UUID (linked deal for tracking)
├─ zoho_referrer_contact_id: UUID (referrer's contact ID in Zoho)
└─ zoho_sync_error: String (error message if last sync failed)
```

### 4.3 Analytics Integration (CTA Tracking)

**Frontend Tracking**:
- **File**: [src/hooks/useCTAs.ts](src/hooks/useCTAs.ts)
- **Function**: `recordCTAClick(ctaId, eventType, metadata)`
- **Events Tracked**:
  - "cta_viewed" – CTA element rendered
  - "cta_clicked" – User clicked button/link
  - "cta_converted" – User took desired action (signup, payment, etc.)

**Data Saved to Database**:
```
cta_analytics
├─ cta_id: UUID (which CTA)
├─ blog_post_id: UUID (which article)
├─ event_type: String (viewed, clicked, converted)
├─ user_id: UUID (who interacted)
├─ session_id: String (for anonymous tracking)
├─ device_type: String (mobile, desktop, tablet)
├─ referrer: URL (where user came from)
├─ metadata: JSON (custom data like button color, variant tested)
└─ created_at: TIMESTAMP
```

**Query for Analytics**:
- Function: `get_blog_post_ctas(post_id, category, tags)`
- Returns: CTA placements filtered by position & conditions

---

## 5. Current Gaps & Limitations

### 5.1 Missing Backend Infrastructure

**Gap 1: No Async Job Queue**
- **Issue**: Zoho sync happens on-demand, not scheduled
- **Impact**: New users might wait for CRM contact creation
- **Workaround**: Currently on OAuth flow (should be background job)
- **Required For**: Reliable lead lifecycle management

**Gap 2: No Event Stream/Event Bus**
- **Issue**: FFR completion, payment success, etc. don't trigger automatic workflows
- **Impact**: CRM updates aren't real-time; marketing automation can't respond to user actions
- **Examples Missing**:
  - FFR_COMPLETED → Generate followup email trigger
  - PAYMENT_SUCCESS → Update CRM deal stage
  - REFERRAL_CONVERTED → Notify referrer

**Gap 3: No Webhook Event Queue/Retry Logic**
- **Issue**: If webhook processing fails, there's no retry mechanism
- **Impact**: Missed payment confirmations could cause inconsistent state
- **Workaround**: Manual intervention or Razorpay retry (not guaranteed)

**Gap 4: No Real-Time Notification System**
- **Issue**: User completes FFR but no automation (email, SMS, in-app notification)
- **Impact**: Missed engagement moments
- **Examples**:
  - "Your FFR Score improved!" email
  - SMS alert for referral conversion
  - Push notification for opportunity

**Gap 5: No Audit Logging**
- **Issue**: Limited visibility into who changed what and when
- **Impact**: Hard to trace data quality issues or customer complaints
- **Example**: "Who changed this user's FFR score?"

**Gap 6: No Transactional Email Service**
- **Issue**: No SendGrid/Resend integration for templated emails
- **Impact**: Can't send sophisticated multi-step sequences
- **Examples Missing**:
  - Welcome email after signup
  - Payment receipt
  - Referral bonus notification

### 5.2 Frontend-Only Logic (Should Move to Backend)

**Issue 1: FFR Calculations Entirely Client-Side**
- **Code**: All math in `calculatorUtils.ts` runs in browser
- **Problem**: 
  - Can't trust results for business logic (payment eligibility, CRM updates)
  - Heavy computation blocks UI
  - No server audit trail
- **Solution**: Move core calculations to Supabase edge function

**Issue 2: No Validation Layer**
- **Problem**: User inputs not validated on backend before calculations
- **Impact**: Garbage-in, garbage-out in analytics
- **Solution**: Add schema validation in edge functions

**Issue 3: No Rate Limiting on Calculations**
- **Problem**: User could spam FFR calculation (DOS risk)
- **Impact**: Supabase excessive write load
- **Solution**: Add per-user rate limit in edge functions

### 5.3 Data Storage Gaps

**Gap 1: Financial Projections Not Persisted**
- **What**: Year-by-year corpus projection table (25+ years)
- **Current**: Recalculated on demand from inputs
- **Issue**: 
  - High cost (recalculation expensive)
  - No audit trail (can't track how score was calculated)
- **Solution**: Cache projections in `user_calculations` table

**Gap 2: User Session Data Lost on Refresh**
- **What**: Lifestyle shift %, health category selected
- **Current**: localStorage only
- **Issue**: Lost on browser clear; no cross-device sync
- **Solution**: Option to save to DB for persistence

**Gap 3: No Soft Delete**
- **What**: When user deletes calculation/data, it's hard-deleted
- **Issue**: Can't restore; no audit trail
- **Solution**: Add deleted_at timestamp field to relevant tables

### 5.4 CRM Sync Gaps

**Gap 1: One-Way Sync Only**
- **Current**: Data flows app → Zoho only
- **Missing**: Zoho → app (e.g., if Zoho updates contact status)
- **Solution**: Listen to Zoho webhooks to pull updates

**Gap 2: No Partial Sync Rollback**
- **Current**: If Zoho update fails mid-sequence, inconsistency
- **Missing**: Transactional guarantees
- **Solution**: Implement two-phase commit or saga pattern

**Gap 3: No Manual Retry UI**
- **Current**: Failed syncs logged in `zoho_conversion_failures`
- **Missing**: Admin ability to retry from dashboard
- **Solution**: Add admin panel with retry button

---

## 6. Required Backend Additions for CRM System

### 6.1 New APIs Needed

**API 1: FFR Assessment Endpoint** (Edge Function)
```
POST /functions/calculate-ffr
Input: {
  user_id: UUID,
  calculator_inputs: CalculatorInputs,
  save_to_db: boolean
}
Output: {
  scores: {
    foundation, habit, literacy, opportunity, decumulation,
    total_conservative, total_base, total_optimistic
  },
  calculations: CalculationResults,
  projections: YearlyProjection[],
  status: "calculated" | "saved"
}
```
- Server-side calculation (no client-side math)
- Validates inputs before processing
- Saves results if `save_to_db = true`
- Returns audit trail

**API 2: FFR Tracking Endpoint** (Edge Function)
```
POST /functions/log-ffr-action
Input: {
  user_id: UUID,
  action_type: String,
  content_id: UUID (optional),
  points_earned: INT,
  metadata: JSON (optional)
}
Output: { success: boolean, action_id: UUID }
```
- Records user engagement with FFR system
- Calculates points
- Updates user progress if applicable
- Triggers events (for automation)

**API 3: User Segment Query** (SQL Function)
```
SELECT users FROM profiles WHERE [criteria]
Examples:
  - FFR score > 70
  - Membership tier = "premium" AND signup_date > NOW() - INTERVAL '30 days'
  - Referred_by_user_id = ?user_id (get all my referrals)
```
- Used for CRM list building
- Used for targeted campaigns

**API 4: User Timeline Query** (SQL Function)
```
SELECT events FROM (
  ffr_user_actions UNION
  payment_transactions UNION
  user_referrals UNION
  user_achievements
) WHERE user_id = ?
ORDER BY created_at DESC
```
- Complete user activity log
- Timeline for customer success tracking

**API 5: Referral Conversion Trigger** (Edge Function)
```
POST /functions/convert-referral
Input: { referral_id: UUID }
Output: { success: boolean, referrer_id: UUID, points_awarded: INT }
```
- Called manually or auto-triggered on payment
- Updates referral status to "converted"
- Notifies referrer
- Updates Zoho

### 6.2 New Data Models Needed

**Table upgrade 1: Extend ffr_user_progress**
```sql
ALTER TABLE ffr_user_progress ADD (
  next_actions        JSON,         -- Recommended actions (array)
  priority_category   STRING,       -- Weakest area (foundation/habit/literacy/opportunity/decumulation)
  improvement_tips    JSON,         -- Personalized advice
  last_email_sent_at  TIMESTAMP,    -- Prevent email spam
  engagement_level    ENUM('low', 'medium', 'high')  -- For segmentation
);
```

**Table upgrade 2: Extend profiles**
```sql
ALTER TABLE profiles ADD (
  lifecycle_stage     ENUM('lead', 'customer', 'advocate', 'churned'),
  last_engagement_at  TIMESTAMP,
  preferred_language  STRING,       -- For emails
  opted_in_emails     BOOLEAN,
  referral_clicks     INT,          -- How many people clicked their code
  referral_conversions INT          -- How many converted
);
```

**New Table: User Events (Event Stream)**
```sql
CREATE TABLE user_events (
  id                  UUID PRIMARY KEY,
  user_id             UUID NOT NULL,
  event_type          VARCHAR(50),  -- "ffr_completed", "payment_success", etc.
  event_data          JSON,         -- Event-specific data
  triggered_at        TIMESTAMP,
  processed_at        TIMESTAMP,    -- When automation ran
  automation_status   ENUM('pending', 'processing', 'completed', 'failed'),
  automation_actions  JSON,         -- [{action: 'email_sent'}, {action: 'crm_updated'}]
  FOREIGN KEY (user_id) REFERENCES profiles(id)
);

-- Index for fast querying
CREATE INDEX idx_user_events_unprocessed ON user_events(user_id, processed_at) 
WHERE automation_status IN ('pending', 'failed');
```

**New Table: CRM Sync Log (Audit Trail)**
```sql
CREATE TABLE crm_sync_log (
  id                  UUID PRIMARY KEY,
  user_id             UUID NOT NULL,
  sync_type           VARCHAR(50),  -- 'contact_create', 'contact_update', 'deal_create'
  request_payload     JSON,         -- What we sent to Zoho
  response_payload    JSON,         -- What Zoho returned
  external_id         UUID,         -- Zoho contact/deal/lead ID
  status              ENUM('success', 'failed', 'pending_retry'),
  error_message       TEXT,
  retry_count         INT DEFAULT 0,
  next_retry_at       TIMESTAMP,
  synced_at           TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id)
);

-- Alert on retries
CREATE INDEX idx_crm_sync_retry ON crm_sync_log(user_id, status, next_retry_at) 
WHERE status = 'pending_retry' AND next_retry_at < NOW();
```

**New Table: Email Campaign Tracking**
```sql
CREATE TABLE email_events (
  id                  UUID PRIMARY KEY,
  user_id             UUID NOT NULL,
  email_type          VARCHAR(50),  -- 'welcome', 'ffreport', 'referral_bonus'
  sent_at             TIMESTAMP,
  opened_at           TIMESTAMP,
  clicked_at          TIMESTAMP,
  failed_reason       TEXT,         -- If bounced/rejected
  template_version    INT,          -- For A/B testing
  FOREIGN KEY (user_id) REFERENCES profiles(id)
);
```

**New Table: Referral Campaigns**
```sql
CREATE TABLE referral_campaigns (
  id                  UUID PRIMARY KEY,
  referrer_user_id    UUID NOT NULL,
  referred_user_id    UUID NOT NULL,
  referral_code       VARCHAR(20),
  status              ENUM('pending', 'converted', 'cancelled'),
  conversion_amount   DECIMAL(10,2), -- What the referred user paid
  referrer_reward     DECIMAL(10,2), -- What referrer gets
  rewarded_at         TIMESTAMP,
  created_at          TIMESTAMP,
  FOREIGN KEY (referrer_user_id) REFERENCES profiles(id),
  FOREIGN KEY (referred_user_id) REFERENCES profiles(id)
);
```

### 6.3 New Event Types to Define

```typescript
// Comprehensive event system for CRM + Lifecycle automation

enum FFREvent {
  FFR_COMPLETED = "ffr_completed",
  FFR_SCORE_IMPROVED = "ffr_score_improved",
  FFR_SCORE_DECLINED = "ffr_score_declined",
  FFR_CHECKLIST_ITEM_COMPLETED = "ffr_checklist_completed",
  FFR_EDUCATIONAL_CONTENT_VIEWED = "ffr_content_viewed",
  FFR_OPPORTUNITY_CLICKED = "ffr_opportunity_clicked",
  FFR_NEXT_STEPS_RECOMMENDED = "ffr_next_steps",
}

enum PaymentEvent {
  PAYMENT_INITIATED = "payment_initiated",
  PAYMENT_AUTHORIZED = "payment_authorized",
  PAYMENT_CAPTURED = "payment_success",
  PAYMENT_FAILED = "payment_failed",
  PAYMENT_REFUNDED = "payment_refunded",
}

enum ReferralEvent {
  REFERRAL_CODE_GENERATED = "referral_code_generated",
  REFERRAL_LINK_CLICKED = "referral_clicked",
  REFERRAL_SIGNUP = "referral_signup",
  REFERRAL_CONVERTED = "referral_converted",
  REFERRAL_BONUS_AWARDED = "referral_bonus",
}

enum UserEvent {
  USER_SIGNED_UP = "user_signup",
  USER_LOGGED_IN = "user_login",
  USER_PROFILE_UPDATED = "profile_updated",
  MEMBERSHIP_UPGRADED = "membership_upgraded",
  MEMBERSHIP_EXPIRED = "membership_expired",
}

enum CRMEvent {
  CONTACT_CREATED = "zoho_contact_created",
  CONTACT_UPDATED = "zoho_contact_updated",
  LEAD_QUALIFIED = "zoho_lead_qualified",
  DEAL_CREATED = "zoho_deal_created",
  DEAL_CLOSED = "zoho_deal_closed",
}
```

### 6.4 Event Publishing Architecture

```
1. Event Triggered (in business logic)
   ↓
2. Create user_events record (status: 'pending')
   ↓
3. Async Job Queue picks up event (background worker)
   ↓
4. Execute Automation Rules:
   - Send email via Sendgrid
   - Update Zoho via API
   - Create CRM task
   - Award referral bonus
   - Update user segment
   ↓
5. Update user_events (status: 'completed' or 'failed')
   ↓
6. If failed: Schedule retry (exponential backoff)
```

**Example: FFR_COMPLETED event**
```json
{
  "event_type": "FFR_COMPLETED",
  "user_id": "user_123",
  "timestamp": "2026-03-24T10:30:00Z",
  "data": {
    "ffrScore": {
      "base": 72,
      "conservative": 57,
      "optimistic": 87
    },
    "components": {
      "foundation": 30,
      "habit": 18,
      "literacy": 15,
      "opportunity": 6,
      "decumulation": 3
    },
    "band": "Good",
    "financialData": {
      "age": 32,
      "lifeExpectancy": 85,
      "initialPortfolioValue": 500000,
      "sipAmount": 25000,
      "yearsToFreedom": 18,
      "freedomAge": 50
    }
  },
  "automations_to_trigger": [
    "send_ffreport_email",
    "update_zoho_contact_score",
    "recommend_coaching_call",
    "add_to_crmlist_readyforpremium"
  ]
}
```

---

## 7. Event Flow Design (Recommended)

### 7.1 Event Flow Diagram

```
┌──────────────────────────────────────────────────────────┐
│ USER COMPLETES FFR CALCULATION                           │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
    ┌────────────────────────┐
    │ Save to user_calculations
    │ Save to ffr_user_progress
    │ Update ffr_foundations_checklist
    └────────────────┬───────┘
                     │
                     ▼
         ┌───────────────────────┐
         │ Publish FFR_COMPLETED │
         │ Event to user_events  │
         │ status: 'pending'     │
         └───────────┬───────────┘
                     │
                     ▼ (async, background job)
        ✉️  Email Automation
        ├─ Send FFR Report email
        ├─ Include score breakdown
        ├─ Provide next steps
        └─ Create email_events record
                     │
                     ▼
        🔄 CRM Automation
        ├─ Update Zoho Contact
        ├─ Add custom field: "FFR_Score" = 72
        ├─ Add custom field: "FFR_Band" = "Good"
        ├─ Create Zoho task if score < 40
        ├─ Update crm_sync_log
        └─ Trigger Zoho workflow (if configured)
                     │
                     ▼
        📊 Analytics
        ├─ Increment user.ffr_completions_count
        ├─ Record event in analytics DB
        ├─ Update user segment (e.g., "HAS_FFR_SCORE")
        └─ Trigger segment-based campaigns
                     │
                     ▼
        🎁 Incentives
        ├─ If new user: Award 50 points
        ├─ If score improved: Send bonus email
        ├─ If eligible: Recommend premium membership
        └─ Check for referral credit eligibility
                     │
                     ▼
        ✅ Mark user_events as processed
           status: 'completed'
```

### 7.2 Event Lifecycle

Each event goes through this state machine:

```
PENDING → PROCESSING → COMPLETED
   ↓          ↓           ↑
   └──────────┴───────────┘
        FAILED → RETRY (exponential backoff)
        ↓
        DEAD_LETTER (after max retries)
```

### 7.3 Specific Event Triggers & Their Locations

**Event 1: FFR_COMPLETED**
- **Trigger Location**: [src/components/financial-planning/context/FinancialPlanningContext.tsx](src/components/financial-planning/context/FinancialPlanningContext.tsx)#L250 (setInputs method)
- **When**: `executeCalculationAndSaveResults()` completes successfully
- **Payload**:
  ```
  {
    user_id, 
    ffrScores: { base, conservative, optimistic },
    components: { foundation, habit, literacy, opportunity, decumulation },
    financialData: { inputs },
    calculationResults
  }
  ```
- **Downstream Actions**:
  - Send "Your FFR Report" email
  - Update Zoho contact field "FFR_Score"
  - Add user to segment "HAS_COMPLETED_FFR"
  - Recommend premium if score low

**Event 2: PAYMENT_SUCCESS**
- **Trigger Location**: `supabase/functions/razorpay-webhook/index.ts`#L75 (payment.captured event)
- **When**: Razorpay confirms payment captured
- **Payload**:
  ```
  {
    user_id,
    payment_id,
    order_id,
    amount,
    plan_type,
    razorpay_signature
  }
  ```
- **Downstream Actions**:
  - Update user_memberships.tier = "premium"
  - Update Zoho deal stage to "Won"
  - Send payment receipt email
  - Award referral bonus if applicable
  - Send "Your premium access is active" email

**Event 3: REFERRAL_SIGNUP**
- **Trigger Location**: [src/contexts/ReferralContext.tsx](src/contexts/ReferralContext.tsx)#L40 (processReferralCode)
- **When**: New user signs up with referral code
- **Payload**:
  ```
  {
    referred_user_id,
    referrer_user_id,
    referral_code
  }
  ```
- **Downstream Actions**:
  - Create referral_campaigns record with status "pending"
  - Update user_referrals table
  - Send "You were referred! Get bonus" email to new user
  - Notify referrer via email

**Event 4: REFERRAL_CONVERTED**
- **Trigger Location**: `supabase/functions/razorpay-webhook/index.ts` (on PAYMENT_SUCCESS)
- **When**: Referred user makes first payment
- **Payload**:
  ```
  {
    referral_id,
    referrer_user_id,
    referred_user_id,
    conversion_amount,
    referrer_reward
  }
  ```
- **Downstream Actions**:
  - Update referral_campaigns.status = "converted"
  - Award referrer account credit/points
  - Send "Your referral converted! You earned ₹XXX" email
  - Update Zoho: referrer contact "Referral_Count" +1
  - Update Zoho: create task for business development team

**Event 5: FFR_CHECKLIST_ITEM_COMPLETED**
- **Trigger Location**: UI component (ffr_foundations_checklist.tsx)
- **When**: User checks off a checklist item
- **Payload**:
  ```
  {
    user_id,
    checklist_item: (kyc_refresh | nomination_updated | sip_mandate_active | ...),
    completed_at
  }
  ```
- **Downstream Actions**:
  - Update ffr_foundations_checklist
  - Recalculate foundation_score
  - If all items checked → Award achievement badge
  - Send progress email ("You've completed 5 of 6 items!")

**Event 6: FFR_SCORE_IMPROVED** (derived event)
- **Trigger Location**: Auto-calculated by background job comparing previous vs current scores
- **When**: ffr_user_progress.total_score_base increases by >= 5 points
- **Payload**:
  ```
  {
    user_id,
    old_score: 65,
    new_score: 72,
    improvement: 7,
    new_band: "Good"
  }
  ```
- **Downstream Actions**:
  - Send congratulations email
  - Award bonus loyalty points
  - Suggest next checkpoint to user
  - Update Zoho: add note "Score improved"

**Event 7: GAP_IDENTIFIED** (from FFR calculation)
- **Trigger Location**: [src/utils/ffrScoring.ts](src/utils/ffrScoring.ts)#L200 (calculateNextSteps)
- **When**: FFRScoringEngine identifies weak area (score < target)
- **Payload**:
  ```
  {
    user_id,
    gap_type: (foundation | habit | literacy | opportunity | decumulation),
    current_score: 15,
    target_score: 20,
    recommendation: "Complete 3 more educational modules"
  }
  ```
- **Downstream Actions**:
  - Add to user_events for follow-up email
  - Recommend specific content in email
  - Create Zoho task for customer success
  - Add user to segment "NEEDS_LITERACY_IMPROVEMENT"

**Event 8: USER_RETURNED** (inactivity-based)
- **Trigger Location**: Background job (not yet implemented, TBD)
- **When**: User logs in after > 30 day gap AND has previous FFR score
- **Payload**:
  ```
  {
    user_id,
    last_activity_date,
    days_away: 35,
    last_ffr_score: 72
  }
  ```
- **Downstream Actions**:
  - Send re-engagement email ("We missed you!")
  - Include updated FFR recommendations
  - Offer "Check Your Updated Score" CTA
  - Update Zoho: "Last Activity" field

### 7.4 Edge Function Implementation for Events

**New Edge Function Needed**: `publish-event`

```typescript
// supabase/functions/publish-event/index.ts

POST /functions/publish-event
Input: {
  user_id: UUID,
  event_type: STRING,
  payload: JSON,
  source: STRING (e.g., 'ffr_calculator', 'payment_webhook',...)
}

Output: {
  success: boolean,
  event_id: UUID,
  status: 'pending'
}

Implementation:
1. Validate event_type against allowed enum
2. Save to user_events table (status: 'pending')
3. Return event_id for tracking
4. Background worker picks up and processes
```

### 7.5 Background Job Architecture (Not Yet Implemented)

**Recommended Stack**:
- **Job Queue**: Redis (via Redis-on-Supabase or separate service)
- **Worker**: Node.js or Deno service polling for pending events
- **Retry Logic**: Exponential backoff (wait 5s, 25s, 125s, max 24h)
- **Monitoring**: Log all executions (event_id, status, error, duration)

**Pseudocode**:

```
LOOP indefinitely:
  pending_events = SELECT * FROM user_events WHERE status = 'pending'
  
  FOR EACH event in pending_events:
    SET event.status = 'processing'
    
    TRY:
      IF event.event_type == 'FFR_COMPLETED':
        send_ffreport_email(event.user_id, event.data)
        update_zoho_contact(event.user_id, {ffr_score: event.data.score})
        check_segment_eligibility(event.user_id)
      
      IF event.event_type == 'PAYMENT_SUCCESS':
        upgrade_membership(event.user_id, event.data.plan_type)
        update_zoho_deal(event.user_id, 'Won')
        process_referral_bonus(event.data)
      
      SET event.status = 'completed'
      SET event.processed_at = NOW()
      LOG "Event processed successfully"
    
    CATCH error:
      IF event.retry_count < MAX_RETRIES:
        event.retry_count += 1
        event.next_retry_at = NOW() + (5 * 2^retry_count) seconds
        event.status = 'pending'
      ELSE:
        SET event.status = 'dead_letter'
        ALERT "Event failed max retries"
      
      LOG "Event processing failed"
  
  SLEEP 5 seconds
```

---

## 8. CRM Integration Summary

### 8.1 Data Flow: App → Zoho

```
User Signs Up (OAuth)
  ↓
Referral code in URL? 
  ├─ YES: Link referrer in profiles.referred_by_user_id
  └─ NO: continue
  ↓
Set profiles.zoho_sync_status = "pending"
  ↓
(Background Job) create-zoho-contact triggers
  ├─ Fetch user data from profiles
  ├─ Call Zoho API: POST /crm/v2/Contacts
  ├─ Zoho returns contact_id, lead_id
  ├─ Update profiles.zoho_contact_id
  ├─ Update profiles.zoho_lead_id
  ├─ Update profiles.zoho_sync_status = "synced"
  └─ OR: Update profiles.zoho_sync_error = "[error detail]"
  ↓
User Completes Payment
  ↓
razorpay-webhook (payment.captured)
  ├─ Create user_memberships record (tier=premium)
  └─ Trigger update-zoho-contact-user-type
  ↓
(Background Job) update-zoho-contact-user-type
  ├─ Fetch user's zoho_contact_id
  ├─ Call Zoho API: PATCH /crm/v2/Contacts/{contact_id}
  ├─ Update custom fields:
  │  ├─ "Plan_Type" = plan_type
  │  ├─ "Payment_Amount" = amount
  │  └─ "Status" = "Customer"
  └─ OR: Log failure to zoho_conversion_failures
  ↓
For Referrals: trigger update-zoho-contact-referral
  ├─ Find referrer's zoho_contact_id
  ├─ Update: "Total_Referrals" += 1
  ├─ Update: "Referral_Revenue" += amount
  ├─ Find referred user's zoho_contact_id
  ├─ Update: "Referred_By" = referrer_name
  └─ Create Zoho task: "Referral Conversion - Follow up"
```

### 8.2 Current Sync Coverage

| Entity | Status | Details |
|--------|--------|---------|
| **Lead Creation** | ✓ Implemented | On signup (triggered by zoho_sync_status) |
| **Lead → Contact Conversion** | ✓ Implemented | On first payment (via update-zoho-contact-user-type) |
| **Contact Details** | ✓ Implemented | Name, email, phone, company |
| **Referral Link** | ✓ Implemented | referred_by_user_id linked, stored in custom field |
| **FFR Score** | ✗ Not Implemented | Need to send FFR score to Zoho on completion |
| **Membership Status** | ✓ Implemented | Set to "Customer" on payment |
| **Deal Creation** | ✗ Not Implemented | Currently no deal tracking |
| **Activity Timeline** | ✗ Not Implemented | Zoho needs activity log |
| **Custom Segments** | ✗ Not Implemented | No segment creation based on FFR score |

---

## 9. Query Examples for Product/CRM Use Cases

### 9.1 Find Users by FFR Score

```sql
-- All users with Good or Excellent FFR
SELECT 
  p.id, p.email, p.first_name, p.last_name,
  f.total_score_base, f.foundation_score, f.habit_score
FROM profiles p
JOIN ffr_user_progress f ON p.id = f.user_id
WHERE f.total_score_base >= 60
  AND p.zoho_contact_id IS NOT NULL
ORDER BY f.total_score_base DESC;
```

### 9.2 Find Referral Conversions (Last 30 Days)

```sql
SELECT 
  ur.referred_by_user_id as referrer_id,
  p_ref.first_name as referrer_name,
  COUNT(ur.id) as conversions,
  SUM(CASE WHEN ur.status = 'converted' THEN 1 ELSE 0 END) as confirmed
FROM user_referrals ur
LEFT JOIN profiles p_ref ON ur.referred_by_user_id = p_ref.id
WHERE ur.status = 'converted'
  AND ur.referral_date >= NOW() - INTERVAL '30 days'
GROUP BY ur.referred_by_user_id
ORDER BY conversions DESC;
```

### 9.3 Find Users Ready for Premium Upgrade

```sql
-- FFR >= 70, not premium, signup > 30 days ago
SELECT 
  p.id, p.email, p.first_name,
  f.total_score_base,
  um.tier,
  AGE(NOW(), p.created_at) as days_as_user
FROM profiles p
JOIN ffr_user_progress f ON p.id = f.user_id
LEFT JOIN user_memberships um ON p.id = um.user_id
WHERE f.total_score_base >= 70
  AND (um.tier IS NULL OR um.tier = 'free')
  AND p.created_at <= NOW() - INTERVAL '30 days'
  AND p.zoho_contact_id IS NOT NULL
ORDER BY f.total_score_base DESC;
```

### 9.4 Email Performance by FFR Band

```sql
SELECT 
  f.total_score_base,
  CASE 
    WHEN f.total_score_base >= 80 THEN 'Excellent'
    WHEN f.total_score_base >= 60 THEN 'Good'
    WHEN f.total_score_base >= 40 THEN 'Developing'
    ELSE 'Getting Started'
  END as ffr_band,
  COUNT(DISTINCT e.user_id) as emails_sent,
  COUNT(DISTINCT CASE WHEN e.opened_at IS NOT NULL THEN e.user_id END) as opens,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN e.opened_at IS NOT NULL THEN e.user_id END) / 
        COUNT(DISTINCT e.user_id), 2) as open_rate,
  COUNT(DISTINCT CASE WHEN e.clicked_at IS NOT NULL THEN e.user_id END) as clicks
FROM email_events e
JOIN ffr_user_progress f ON e.user_id = f.user_id
WHERE e.sent_at >= NOW() - INTERVAL '30 days'
GROUP BY ffr_band, f.total_score_base
ORDER BY f.total_score_base DESC;
```

---

## 10. Implementation Roadmap

### Phase 1 (Weeks 1-2): Foundation
- [ ] Document all existing FFR flows (completed ✓)
- [ ] Set up user_events table & automated event logging
- [ ] Implement FFR_COMPLETED event trigger
- [ ] Basic background job worker for email events

### Phase 2 (Weeks 3-4): CRM Enhancement
- [ ] Add FFR score sync to Zoho (on event trigger)
- [ ] Implement event-based email automation (Sendgrid integration)
- [ ] Track email opens/clicks
- [ ] Create customer segments based on FFR score

### Phase 3 (Weeks 5-6): Lifecycle Automation
- [ ] Implement REFERRAL_CONVERTED automation
- [ ] Add referral bonus award mechanism
- [ ] Create "abandoned FFR" re-engagement workflow
- [ ] Build admin dashboard for event monitoring

### Phase 4 (Weeks 7+): Advanced
- [ ] Machine learning: Predict at-risk users (based on engagement)
- [ ] Two-way Zoho sync (pull Zoho updates into app)
- [ ] Advanced segmentation (propensity to upgrade)
- [ ] A/B testing framework for email campaigns

---

## Appendix: Key Code Locations Reference

| Feature | Primary File | Related Files |
|---------|-------------|---------------|
| **FFR Scoring** | `src/utils/ffrScoring.ts` | `src/hooks/useFFR.ts`, `src/types/ffr.ts` |
| **Financial Planning Context** | `src/components/financial-planning/context/FinancialPlanningContext.tsx` | `src/types/financial-planning.ts` |
| **Calculator Logic** | `src/utils/calculatorUtils.ts` | `src/types/calculator.ts` |
| **Payment Integration** | `supabase/functions/create-razorpay-order/index.ts` | `supabase/functions/razorpay-webhook/index.ts`, `src/hooks/useRazorpayPayment.ts` |
| **CRM Integration** | `supabase/functions/create-zoho-contact/index.ts` | `supabase/functions/update-zoho-contact-user-type/index.ts`, `supabase/functions/update-zoho-contact-referral/index.ts` |
| **Database Schema** | `src/integrations/supabase/types.ts` | `supabase/config.toml` |
| **Referral Processing** | `src/contexts/ReferralContext.tsx` | `src/hooks/useReferrals.ts`, `src/contexts/AuthContext.tsx` |
| **Authentication** | `src/contexts/AuthContext.tsx` | `src/integrations/supabase/client.ts` |

---

**Document End**
