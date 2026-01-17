# GoCardless Implementation - Complete Guide

## 📋 Overview

This guide will help you implement GoCardless Direct Debit subscription payments into your Finance.AI app with a subscription gate that locks the dashboard until payment is complete.

---

## ✅ What's Been Created

I've created all the necessary files for you. Here's what you need to do:

### 1. **Install Dependencies**

```bash
pnpm add gocardless-nodejs
# or
npm install gocardless-nodejs
```

### 2. **Database Setup**

**File:** `database-schema-gocardless.sql`

1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Copy the contents of `database-schema-gocardless.sql`
4. Run the migration

This creates the `subscriptions` table with GoCardless fields.

### 3. **Environment Variables**

**File:** `.env.example`

1. Copy `.env.example` to `.env.local`
2. Add your keys:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# GoCardless
GOCARDLESS_ACCESS_TOKEN=sandbox_xxxxx
GOCARDLESS_ENVIRONMENT=sandbox
GOCARDLESS_WEBHOOK_SECRET=xxxxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📂 File Mapping

Copy these files to the correct locations in your project:

### Backend Files:

| Source File | Destination | Purpose |
|------------|-------------|---------|
| `lib-gocardless-client.ts` | `lib/gocardless/client.ts` | GoCardless SDK client |
| `lib-gocardless-subscription.ts` | `lib/gocardless/subscription.ts` | Subscription helpers |
| `api-gocardless-create-subscription-route.ts` | `app/api/gocardless/create-subscription/route.ts` | Create subscription API |
| `api-gocardless-callback-route.ts` | `app/api/gocardless/callback/route.ts` | Handle return from GoCardless |
| `api-gocardless-check-status-route.ts` | `app/api/gocardless/check-status/route.ts` | Check subscription status |
| `api-webhooks-gocardless-route.ts` | `app/api/webhooks/gocardless/route.ts` | Webhook handler |

### Frontend Files:

| Source File | Destination | Purpose |
|------------|-------------|---------|
| `components-subscription-gate.tsx` | `components/subscription-gate.tsx` | Paywall component |
| `dashboard-page-WITH-SUBSCRIPTION.tsx` | `app/dashboard/page.tsx` | Dashboard with gate |

---

## 🚀 Implementation Steps

### Step 1: Create Folder Structure

```bash
# In your project root
mkdir -p lib/gocardless
mkdir -p app/api/gocardless/create-subscription
mkdir -p app/api/gocardless/callback
mkdir -p app/api/gocardless/check-status
mkdir -p app/api/webhooks/gocardless
```

### Step 2: Copy Backend Files

```bash
# Copy GoCardless library files
cp lib-gocardless-client.ts lib/gocardless/client.ts
cp lib-gocardless-subscription.ts lib/gocardless/subscription.ts

# Copy API routes
cp api-gocardless-create-subscription-route.ts app/api/gocardless/create-subscription/route.ts
cp api-gocardless-callback-route.ts app/api/gocardless/callback/route.ts
cp api-gocardless-check-status-route.ts app/api/gocardless/check-status/route.ts
cp api-webhooks-gocardless-route.ts app/api/webhooks/gocardless/route.ts
```

### Step 3: Copy Frontend Files

```bash
# Copy subscription gate component
cp components-subscription-gate.tsx components/subscription-gate.tsx

# Replace dashboard page
cp dashboard-page-WITH-SUBSCRIPTION.tsx app/dashboard/page.tsx
```

### Step 4: Create Supabase Server Client Helper

Create `lib/supabase/server.ts` if you don't have it:

```typescript
// lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    },
  )
}
```

---

## 🧪 Testing Flow

### 1. **Start Your App**

```bash
pnpm run dev
```

### 2. **Test the Subscription Flow**

1. **Go to Dashboard:**
   - Navigate to `http://localhost:3000/dashboard`
   - You should see the subscription gate (blurred content + pricing cards)

2. **Click Subscribe:**
   - Select a plan (Basic or Premium)
   - Click "Subscribe" button
   - You'll be redirected to GoCardless hosted pages

3. **Complete Payment:**
   - Use test bank details:
     - Account Number: `55779911`
     - Sort Code: `20-00-00`
   - Complete the Direct Debit mandate

4. **Return to Dashboard:**
   - You'll be redirected back to `/dashboard`
   - Content should now be unlocked

### 3. **Test Webhook Events**

Use GoCardless dashboard to simulate events:
1. Go to GoCardless sandbox dashboard
2. Find your subscription
3. Trigger test events (payment created, payment confirmed, etc.)
4. Check your database to see status updates

---

## 🔒 Security Checklist

- [ ] Never expose `GOCARDLESS_ACCESS_TOKEN` in frontend code
- [ ] Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code
- [ ] Webhook signature verification is enabled
- [ ] All API routes check user authentication
- [ ] Database has Row Level Security enabled

---

## 📊 Subscription Plans

Current plans (edit in `lib/gocardless/subscription.ts`):

```typescript
export const SUBSCRIPTION_PLANS = [
  {
    id: "basic",
    name: "Basic Plan",
    amount: 999, // £9.99
    interval: "monthly",
    currency: "GBP",
  },
  {
    id: "premium",
    name: "Premium Plan",
    amount: 1999, // £19.99
    interval: "monthly",
    currency: "GBP",
  },
]
```

To change pricing, edit the `amount` field (in pence).

---

## 🐛 Troubleshooting

### Issue: "Webhook signature invalid"

**Solution:** Make sure `GOCARDLESS_WEBHOOK_SECRET` matches the secret in your GoCardless dashboard.

### Issue: "Subscription not found in database"

**Solution:** Check that the webhook endpoint is receiving events. Use ngrok for local testing:

```bash
ngrok http 3000
# Then update webhook URL in GoCardless to: https://xxx.ngrok.io/api/webhooks/gocardless
```

### Issue: "User redirected but subscription not active"

**Solution:**
1. Check webhook logs in GoCardless dashboard
2. Verify database was updated
3. Check browser console for API errors

### Issue: "GoCardless client not initialized"

**Solution:** Verify `GOCARDLESS_ACCESS_TOKEN` is set in `.env.local`

---

## 🌐 Going Live

### 1. **Complete GoCardless Verification**
- Submit business details
- Complete KYC process
- Wait for approval

### 2. **Switch to Live Mode**
```env
GOCARDLESS_ACCESS_TOKEN=live_xxxxx  # Get from GoCardless dashboard
GOCARDLESS_ENVIRONMENT=live
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 3. **Update Webhook URL**
- In GoCardless dashboard, update webhook to production URL
- URL: `https://yourdomain.com/api/webhooks/gocardless`

### 4. **Test in Production**
- Use real bank details
- Complete full flow
- Monitor webhooks

---

## 💰 Pricing & Fees

**GoCardless Fees:**
- UK Direct Debit: 1% capped at £2 per transaction
- No setup fees
- No monthly fees

**Example:**
- £9.99/month subscription = £0.10 fee (1%)
- £19.99/month subscription = £0.20 fee (1%)
- £250/month subscription = £2.00 fee (1% capped)

---

## 📚 Additional Resources

- [GoCardless API Docs](https://developer.gocardless.com/)
- [GoCardless Node SDK](https://github.com/gocardless/gocardless-nodejs)
- [Webhook Events Reference](https://developer.gocardless.com/api-reference/#webhooks)
- [Direct Debit Guide](https://gocardless.com/guides/direct-debit/)

---

## ✨ Features Implemented

- ✅ Subscription gate on dashboard (blur + paywall)
- ✅ Two pricing tiers (Basic & Premium)
- ✅ GoCardless hosted payment flow
- ✅ Automatic redirect after payment
- ✅ Server-side subscription verification
- ✅ Webhook handling for all events
- ✅ Database persistence
- ✅ Secure API routes
- ✅ Loading states and error handling

---

## 🎯 Next Steps

1. Install dependencies: `pnpm add gocardless-nodejs`
2. Run database migration
3. Add environment variables
4. Copy all files to correct locations
5. Test in sandbox mode
6. Go live when ready!

---

## Need Help?

- GoCardless Support: support@gocardless.com
- GoCardless Documentation: https://developer.gocardless.com/
- Supabase Documentation: https://supabase.com/docs

Good luck with your implementation! 🚀
