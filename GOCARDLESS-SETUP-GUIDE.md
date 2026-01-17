# GoCardless Integration Setup Guide

## Prerequisites
- GoCardless account (sign up at https://gocardless.com)
- Supabase project
- Next.js app running

---

## Step 1: Install Dependencies

```bash
pnpm add gocardless-nodejs
# or
npm install gocardless-nodejs
```

---

## Step 2: GoCardless Account Setup

1. **Sign up for GoCardless:**
   - Go to https://gocardless.com
   - Create an account
   - Complete verification

2. **Get API Keys:**
   - Go to Developer > API Keys
   - Copy your **Access Token** (use sandbox token for testing)
   - Save it securely

3. **Create Webhook:**
   - Go to Developer > Webhooks
   - Click "Create Webhook"
   - URL: `https://your-domain.com/api/webhooks/gocardless`
   - Copy the **Webhook Secret**

---

## Step 3: Database Setup

1. **Open Supabase Dashboard:**
   - Go to your project
   - Click "SQL Editor"

2. **Run the migration:**
   - Copy the contents of `database-schema-gocardless.sql`
   - Paste into SQL Editor
   - Click "Run"

3. **Verify:**
   - Go to "Table Editor"
   - Check that `subscriptions` table has new GoCardless columns

---

## Step 4: Environment Variables

1. **Copy `.env.example` to `.env.local`:**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in the values:**
   ```env
   # Supabase (from your Supabase dashboard)
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
   SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

   # GoCardless (from GoCardless dashboard)
   GOCARDLESS_ACCESS_TOKEN=sandbox_xxxxx  # or live_xxxxx for production
   GOCARDLESS_ENVIRONMENT=sandbox  # or 'live' for production
   GOCARDLESS_WEBHOOK_SECRET=xxxxx

   # App URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change to your domain in production
   ```

---

## Step 5: File Structure

Create these files in your project:

```
├── lib/
│   └── gocardless/
│       ├── client.ts           # GoCardless client
│       └── subscription.ts     # Subscription helpers
├── app/
│   └── api/
│       ├── gocardless/
│       │   ├── create-subscription/route.ts
│       │   └── check-status/route.ts
│       └── webhooks/
│           └── gocardless/route.ts
├── components/
│   └── subscription-gate.tsx   # Paywall component
```

---

## Step 6: Copy Implementation Files

I'll create all the implementation files for you. Copy each file to the correct location in your project.

---

## Step 7: Testing

### Test with Sandbox Mode:

1. **Start your app:**
   ```bash
   pnpm run dev
   ```

2. **Go to dashboard:**
   - Navigate to `/dashboard`
   - You should see the subscription gate

3. **Click Subscribe:**
   - You'll be redirected to GoCardless hosted payment page
   - Use test bank details (GoCardless provides these)
   - Complete the flow

4. **Test webhook:**
   - Use GoCardless dashboard to simulate events
   - Or use ngrok to expose your local server

### GoCardless Test Bank Details:
```
Account Number: 55779911
Sort Code: 20-00-00
```

---

## Step 8: Go Live

When ready to go live:

1. **Switch to live mode:**
   ```env
   GOCARDLESS_ACCESS_TOKEN=live_xxxxx
   GOCARDLESS_ENVIRONMENT=live
   ```

2. **Update webhook URL:**
   - In GoCardless dashboard, update webhook to production URL

3. **Complete GoCardless verification:**
   - Submit business details
   - Complete KYC process

---

## Pricing Notes

**GoCardless Fees:**
- UK Direct Debit: 1% capped at £2
- European Direct Debit: 1% capped at €2
- No setup fees
- No monthly fees

**Recommended Subscription Plans:**
- Basic: £9.99/month
- Premium: £19.99/month

---

## Support

- GoCardless Docs: https://developer.gocardless.com/
- GoCardless Support: support@gocardless.com
- Sandbox Testing: https://manage-sandbox.gocardless.com/

---

## Next Steps

1. Install dependencies
2. Set up database
3. Add environment variables
4. Copy implementation files (I'll create these next)
5. Test in sandbox mode
6. Go live!
