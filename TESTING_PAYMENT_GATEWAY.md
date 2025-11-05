# Payment Gateway Testing Guide

## Overview
This guide covers testing the Razorpay payment integration and managing test users for the membership upgrade system.

---

## Test Payment Card Details

### Razorpay Test Mode Cards

#### ✅ Successful Payment Cards

**Card 1: Domestic (India) - Visa**
- **Card Number:** `4386 2894 0766 0153`
- **CVV:** Any 3 digits (e.g., `123`)
- **Expiry:** Any future date (e.g., `12/25`)
- **Name:** Any name
- **Result:** Payment will succeed
- **Note:** Enter random OTP between 4-10 digits for success

**Card 2: Domestic (India) - Mastercard**
- **Card Number:** `2305 3242 5784 8228`
- **CVV:** Any 3 digits
- **Expiry:** Any future date
- **Name:** Any name
- **Result:** Payment will succeed
- **Note:** Enter random OTP between 4-10 digits for success

**Card 3: International - Mastercard**
- **Card Number:** `5104 0600 0000 0008`
- **CVV:** Any 3 digits
- **Expiry:** Any future date
- **Name:** Any name
- **Result:** Payment will succeed

#### ❌ Failed Payment Cards

**Card for Testing Failures**
- **Use any domestic test card above**
- **CVV:** Any 3 digits
- **Expiry:** Any future date
- **Name:** Any name
- **OTP:** Enter OTP with less than 4 digits (e.g., `123`)
- **Result:** Payment will fail

#### 🔄 Additional Test Cards

**International - Visa**
- **Card Number:** `4012 8888 8888 1881`
- **CVV:** Any 3 digits
- **Expiry:** Any future date
- **Result:** Payment will succeed

**International - Mastercard (with address collection)**
- **Card Number:** `5105 1051 0510 5100`
- **CVV:** Any 3 digits
- **Expiry:** Any future date
- **Note:** Will prompt for address - use: 21 Applegate Apartment, Rockledge Street, New York, NY, US, 11561

---

## Testing Payment Flow

### Step 1: Prepare Test Environment

1. **Verify Test Mode is Active**
   - Check that `PAYMENT_ENVIRONMENT` secret is set to `test` (not `production`)
   - Verify in Supabase Edge Functions secrets

2. **Have Test User Account Ready**
   - Sign up or log in with a test account
   - Note down the user's email for tracking

### Step 2: Initiate Payment

1. Navigate to the membership upgrade page
2. Select a plan (Pro or Client tier)
3. Click the payment button
4. Razorpay checkout modal will open

### Step 3: Complete Test Payment

1. **Use one of the test cards above**
2. Fill in the payment form:
   - Card number (with spaces or without)
   - Expiry date (MM/YY format)
   - CVV
   - Cardholder name
3. Click "Pay" button
4. Wait for webhook processing (usually 2-5 seconds)

### Step 4: Verify Payment Success

1. **Check UI Response:**
   - Success page should appear
   - Membership tier should update in the dashboard

2. **Check Database:**
   ```sql
   -- Check user membership was upgraded
   SELECT * FROM user_memberships WHERE user_id = '<user_uuid>';
   
   -- Check payment record was created
   SELECT * FROM razorpay_payments WHERE user_id = '<user_uuid>' ORDER BY created_at DESC LIMIT 1;
   
   -- Check order status
   SELECT * FROM razorpay_orders WHERE user_id = '<user_uuid>' ORDER BY created_at DESC LIMIT 1;
   ```

3. **Check Razorpay Dashboard:**
   - Go to https://dashboard.razorpay.com/app/payments
   - Switch to "Test Mode" 
   - Verify payment appears in the list

4. **Check Edge Function Logs:**
   - Check `razorpay-webhook` function logs for successful processing

---

## Reverting Premium Users (For Testing)

### Method 1: SQL Script (Recommended for Testing)

Use this SQL query in Supabase SQL Editor to revert a user to free tier:

```sql
-- Replace '<user_email>' with the actual user email
UPDATE public.user_memberships
SET 
  tier = 'free',
  upgraded_at = NULL,
  subscription_status = NULL,
  payment_id = NULL,
  payment_date = NULL,
  razorpay_order_id = NULL
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = '<user_email>'
);

-- Verify the update
SELECT 
  um.tier,
  um.upgraded_at,
  um.subscription_status,
  au.email
FROM user_memberships um
JOIN auth.users au ON um.user_id = au.id
WHERE au.email = '<user_email>';
```

### Method 2: Revert by User ID

If you know the user's UUID:

```sql
UPDATE public.user_memberships
SET 
  tier = 'free',
  upgraded_at = NULL,
  subscription_status = NULL,
  payment_id = NULL,
  payment_date = NULL,
  razorpay_order_id = NULL
WHERE user_id = '<user_uuid>';
```

### Method 3: Revert All Test Users

**⚠️ CAUTION: Only use in test environment**

```sql
-- Revert ALL users to free tier (use carefully!)
UPDATE public.user_memberships
SET 
  tier = 'free',
  upgraded_at = NULL,
  subscription_status = NULL,
  payment_id = NULL,
  payment_date = NULL,
  razorpay_order_id = NULL;
```

---

## Common Testing Scenarios

### Scenario 1: Test Successful Upgrade
1. Start with free tier user
2. Use successful test card (`4386 2894 0766 0153`)
3. Enter OTP with 4-10 digits (e.g., `123456`)
4. Complete payment
5. Verify tier upgrade in UI and database
6. Revert user to free tier using SQL

### Scenario 2: Test Failed Payment
1. Start with free tier user
2. Use any domestic test card
3. Enter OTP with less than 4 digits (e.g., `123`)
4. Attempt payment
5. Verify error message is shown
6. Verify user remains on free tier

### Scenario 3: Test Webhook Handling
1. Complete successful payment
2. Check `razorpay-webhook` edge function logs
3. Verify all webhook events are processed:
   - `payment.authorized`
   - `payment.captured`
4. Verify database records created correctly

### Scenario 4: Test Zoho Lead Conversion
1. Complete successful payment
2. Check `convert-zoho-lead-to-contact` function was triggered
3. Verify Zoho CRM shows:
   - Lead converted to Contact
   - Deal created with payment amount
   - Contact has correct status

---

## Troubleshooting

### Payment Not Completing

**Check:**
1. Network tab for failed requests
2. Browser console for JavaScript errors
3. Razorpay webhook logs in edge functions
4. Test mode is enabled
5. Webhook secret is correctly configured

### Membership Not Upgrading

**Check:**
1. `razorpay-webhook` function logs
2. `user_memberships` table was updated
3. Webhook signature verification passed
4. Order ID matches between Razorpay and database

### Zoho Integration Issues

**Check:**
1. `zoho_conversion_failures` table for errors
2. Zoho API credentials are valid
3. Lead exists in Zoho CRM
4. Edge function has correct permissions

---

## Important Notes

### Test vs Production Mode

- **Test Mode:** Uses test cards, no real money charged
  - Test cards work
  - Test Razorpay dashboard
  - Test webhook secret
  
- **Production Mode:** Real payments, real money
  - Only real cards work
  - Production Razorpay dashboard
  - Production webhook secret

### Webhook Configuration

Ensure webhook is configured in Razorpay dashboard:
- **URL:** `https://xmmyjphoaqazwlifehxs.supabase.co/functions/v1/razorpay-webhook`
- **Active Events:**
  - `payment.authorized`
  - `payment.captured`
  - `payment.failed`
  - `order.paid`
- **Secret:** Must match `RAZORPAY_TEST_WEBHOOK_SECRET` in Supabase

### Database Triggers

The following triggers run automatically:
- New user signup → Creates free tier membership
- Payment captured → Upgrades membership
- Payment captured → Triggers Zoho lead conversion

---

## Quick Reference

### Test Card Numbers
- ✅ Domestic Success: `4386 2894 0766 0153` (Visa) or `2305 3242 5784 8228` (Mastercard)
- ✅ International Success: `5104 0600 0000 0008` (Mastercard)
- ❌ Failure: Any domestic card + OTP < 4 digits
- 📝 Note: Always use OTP with 4-10 digits for success, <4 digits for failure

### Revert User SQL (One-liner)
```sql
UPDATE user_memberships SET tier = 'free', upgraded_at = NULL, subscription_status = NULL, payment_id = NULL, payment_date = NULL, razorpay_order_id = NULL WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user@example.com');
```

### Key Tables
- `user_memberships` - User tier and subscription status
- `razorpay_orders` - Order records
- `razorpay_payments` - Payment records
- `payment_transactions` - Webhook event logs
- `zoho_conversion_failures` - Failed Zoho conversions

---

## Support Resources

- **Razorpay Test Cards:** https://razorpay.com/docs/payments/payments/test-card-upi-details/
- **Razorpay Dashboard (Test):** https://dashboard.razorpay.com/app/dashboard
- **Supabase Dashboard:** https://supabase.com/dashboard/project/xmmyjphoaqazwlifehxs
- **Edge Function Logs:** Check in Supabase dashboard under Functions section
