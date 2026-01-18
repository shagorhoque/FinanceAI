# 🚀 Complete GoCardless Implementation Guide

## Payment Links Connected:
- **Basic Plan (£5.99/month):** https://pay.gocardless.com/BRT000499T6GX9P
- **Premium Plan (£16.99/month):** https://pay.gocardless.com/BRT000499THFG2E

---

## 📂 Files to Copy (Copy & Paste)

### 1. **Subscription Gate Component**
**File:** `components/subscription-gate.tsx`
**Copy from:** `SUBSCRIPTION-GATE-IMPLEMENTATION.tsx`

This shows users the pricing options and redirects to GoCardless.

### 2. **Dashboard Page**
**File:** `app/dashboard/page.tsx`
**Copy from:** `DASHBOARD-PAGE-IMPLEMENTATION.tsx`

This is your main dashboard with the subscription gate.

### 3. **Webhook Handler**
**File:** `app/api/webhooks/gocardless/route.ts`
**Copy from:** `WEBHOOK-HANDLER-IMPLEMENTATION.tsx`

This automatically activates subscriptions when users pay.

### 4. **Manual Activation Page**
**File:** `app/activate/page.tsx`
**Copy from:** `ACTIVATE-SUBSCRIPTION-PAGE.tsx`

Backup activation if webhooks don't work immediately.

---

## 🔧 GoCardless Dashboard Setup

### **Step 1: Configure Payment Links**

For EACH payment link, set the redirect URL:

1. Go to: https://manage.gocardless.com (or sandbox)
2. Click on "Payment Links"
3. Find your payment links:
   - `BRT000499T6GX9P` (Basic £5.99)
   - `BRT000499THFG2E` (Premium £16.99)
4. Click "Edit" on each
5. Set **Success redirect URL** to:
   ```
   https://your-app.vercel.app/activate
   ```
   Or for local testing:
   ```
   http://localhost:3000/activate
   ```

### **Step 2: Set Up Webhook**

1. Go to: https://manage.gocardless.com/developers/webhooks
2. Click "Create webhook"
3. **Webhook URL:**
   ```
   https://your-app.vercel.app/api/webhooks/gocardless
   ```
4. **Events to send:** Select all subscription and payment events
5. Copy the **Webhook Secret** and save it

---

## ⚙️ Environment Variables

Add to Vercel (and `.env.local` for local):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://vgcbknhygdubhjixtxey.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# GoCardless (optional - only needed for webhook verification)
GOCARDLESS_WEBHOOK_SECRET=your_webhook_secret_from_step_2

# App
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

---

## 🗄️ Database Setup

Run this in Supabase SQL Editor:

```sql
-- Create subscriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gocardless_subscription_id TEXT,
  gocardless_customer_id TEXT,
  subscription_status TEXT NOT NULL DEFAULT 'pending',
  plan TEXT NOT NULL DEFAULT 'basic',
  amount_in_pence INTEGER,
  currency TEXT DEFAULT 'GBP',
  started_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view own subscription
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert own subscription
CREATE POLICY "Users can insert own subscription"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Service role can update
CREATE POLICY "Service role can update subscriptions"
  ON subscriptions FOR UPDATE
  USING (true);
```

---

## 🎯 How It Works

### **User Flow:**

```
1. User visits /dashboard
   ↓
2. Sees subscription gate (content blurred)
   ↓
3. Clicks "Subscribe to Basic" or "Subscribe to Premium"
   ↓
4. Redirected to GoCardless payment page
   ↓
5. Completes Direct Debit setup
   ↓
6. Redirected to /activate page
   ↓
7. Clicks "Activate Subscription"
   ↓
8. Subscription activated in database
   ↓
9. Redirected to /dashboard with full access
```

### **Webhook (Automatic):**

When user pays, GoCardless sends webhook → Updates database automatically → No manual activation needed

---

## 🧪 Testing

### **Test Locally:**

1. Copy all 4 files to correct locations
2. Add environment variables to `.env.local`
3. Run: `npm run dev`
4. Visit: `http://localhost:3000/dashboard`
5. Click a plan → Opens GoCardless (test mode)
6. Complete payment with test bank details
7. Redirected to `/activate`
8. Click "Activate Subscription"
9. Dashboard unlocks!

### **Test on Production:**

Same flow, but with your live Vercel URL.

---

## 🔑 GoCardless Test Details

**Test Bank Account:**
- Account Number: `55779911`
- Sort Code: `20-00-00`

Use these in sandbox mode to test payments without real money.

---

## 📋 Checklist

- [ ] Copy `SUBSCRIPTION-GATE-IMPLEMENTATION.tsx` to `components/subscription-gate.tsx`
- [ ] Copy `DASHBOARD-PAGE-IMPLEMENTATION.tsx` to `app/dashboard/page.tsx`
- [ ] Copy `WEBHOOK-HANDLER-IMPLEMENTATION.tsx` to `app/api/webhooks/gocardless/route.ts`
- [ ] Copy `ACTIVATE-SUBSCRIPTION-PAGE.tsx` to `app/activate/page.tsx`
- [ ] Set GoCardless redirect URLs to `/activate`
- [ ] Set up GoCardless webhook
- [ ] Add environment variables to Vercel
- [ ] Run database migration in Supabase
- [ ] Test the full flow!

---

## 🆘 Troubleshooting

### **Payment link doesn't redirect back:**
- Check GoCardless redirect URL is set correctly
- Should be: `https://your-app.vercel.app/activate`

### **Subscription not activating:**
- Go to `/activate` page manually
- Click "Activate Subscription"
- Check browser console for errors

### **Dashboard still shows subscription gate:**
- Check database: is subscription_status = 'active'?
- Check user is logged in
- Clear browser cache and reload

### **Webhook not working:**
- Check webhook URL in GoCardless dashboard
- Check webhook secret in environment variables
- Check Vercel function logs

---

## 💡 Tips

1. **Test with sandbox first** before going live
2. **Use `/activate` page** if webhook is delayed
3. **Check Supabase logs** for database errors
4. **Check Vercel logs** for webhook errors
5. **Users must be logged in** before subscribing

---

## 🎉 You're Done!

Once you copy the 4 files and configure GoCardless, your payment flow will be fully working!

Users can subscribe, pay via GoCardless, and get instant access to the dashboard.
