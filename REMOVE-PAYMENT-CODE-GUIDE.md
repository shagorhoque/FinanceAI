# Remove Payment/Subscription Code - Complete Guide

This guide will help you remove all payment and subscription code from your Finance.AI app so users can sign in and go straight to the dashboard.

## Files to DELETE Completely

### 1. Payment/Checkout Pages
```bash
# Delete these if they exist in your app folder:
app/checkout/[productId]/page.tsx
app/checkout/success/page.tsx
app/pricing/page.tsx
app/subscribe/page.tsx
```

### 2. Payment Components
```bash
# Delete these from components folder:
components/checkout.tsx
components/payment-modal/
components/pricing-card.tsx
components/subscription-modal/
```

### 3. Payment API Routes
```bash
# Delete these API routes:
app/api/checkout/route.ts
app/api/create-checkout-session/route.ts
app/api/webhooks/stripe/route.ts
app/api/webhooks/square/route.ts
app/api/subscription/route.ts
```

---

## Files to UPDATE (Remove Subscription Checks)

### 1. **components/sidebar-nav.tsx**
**REPLACE WITH:** The file `sidebar-nav-NO-SUBSCRIPTION.tsx` I just created.

**Changes:**
- ❌ Removed `premiumOnly` field from nav items
- ❌ Removed `userPlan` state
- ❌ Removed subscription fetch from Supabase
- ❌ Removed `isPremium` check
- ❌ Removed lock icons on premium features
- ✅ All features now accessible to everyone

**How to update:**
```bash
cp sidebar-nav-NO-SUBSCRIPTION.tsx components/sidebar-nav.tsx
```

---

### 2. **app/dashboard/page.tsx** (if it has subscription checks)
Remove any code like this:
```typescript
// ❌ REMOVE THIS:
useEffect(() => {
  const checkSubscription = async () => {
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .single()

    if (!subscription || subscription.status !== "active") {
      router.push("/pricing")
    }
  }
  checkSubscription()
}, [])
```

---

### 3. **app/dashboard/layout.tsx** (if it exists)
Remove any subscription verification:
```typescript
// ❌ REMOVE server-side subscription checks like:
const { data: subscription } = await supabase
  .from("subscriptions")
  .select("status")
  .eq("user_id", user.id)
  .single()

if (!subscription || subscription.status !== "active") {
  redirect("/pricing")
}
```

---

### 4. **middleware.ts** (if it exists)
Remove subscription checks:
```typescript
// ❌ REMOVE routes that require subscription:
const protectedRoutes = ["/dashboard", "/investments", "/ai-advisor"]
const requiresSubscription = protectedRoutes.some(route =>
  pathname.startsWith(route)
)

if (requiresSubscription) {
  // Check subscription and redirect...
}
```

**KEEP:** Authentication checks - users should still need to be logged in

---

### 5. **Sign-in/OAuth Callback**

#### Update: `app/auth/callback/route.ts`
```typescript
// Change redirect from pricing to dashboard:

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // ✅ CHANGE THIS:
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
  // ❌ NOT THIS:
  // return NextResponse.redirect(new URL('/pricing', requestUrl.origin))
}
```

#### Update: Your login page (e.g., `app/login/page.tsx`)
```typescript
// After successful email/password sign-in:
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
})

if (!error) {
  // ✅ CHANGE TO:
  router.push('/dashboard')
  // ❌ NOT:
  // router.push('/pricing')
}
```

---

## Environment Variables to Remove

### Remove from `.env` / `.env.local`:
```bash
# ❌ DELETE these:
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

SQUARE_ACCESS_TOKEN=
SQUARE_APPLICATION_ID=
SQUARE_LOCATION_ID=
```

---

## Database Changes (Optional - for clean up)

You can optionally remove subscription-related tables, but it's safer to leave them:

```sql
-- OPTIONAL - Only if you want to clean up database completely
-- This will delete all subscription data (cannot be undone!)

-- DROP TABLE IF EXISTS subscriptions;
-- DROP TABLE IF EXISTS payments;
```

**Recommendation:** Leave the tables in place but just ignore them in your code.

---

## Package Dependencies to Remove

### Update `package.json`:
```bash
# Run these commands to uninstall payment SDKs:
npm uninstall stripe @stripe/stripe-js
npm uninstall square
```

---

## Quick Checklist

- [ ] Delete checkout/payment pages
- [ ] Delete payment components
- [ ] Delete payment API routes
- [ ] Update `sidebar-nav.tsx` (remove premium locks)
- [ ] Remove subscription checks from dashboard
- [ ] Remove subscription checks from layouts
- [ ] Update middleware (keep auth, remove subscription checks)
- [ ] Update OAuth callback to redirect to `/dashboard`
- [ ] Update login page to redirect to `/dashboard`
- [ ] Remove payment env variables
- [ ] Uninstall payment SDKs

---

## Testing After Removal

1. **Test Google Sign-in:**
   - Click "Sign in with Google"
   - Should redirect to `/dashboard` (not `/pricing`)

2. **Test Facebook Sign-in:**
   - Click "Sign in with Facebook"
   - Should redirect to `/dashboard` (not `/pricing`)

3. **Test Email Sign-in:**
   - Sign in with email/password
   - Should redirect to `/dashboard` (not `/pricing`)

4. **Test Dashboard Access:**
   - Go to `/dashboard` directly
   - Should show dashboard (not redirect to pricing)

5. **Test All Features:**
   - Stock Search - should work (no lock icon)
   - AI Advisor - should work (no lock icon)
   - All sidebar items should be clickable

---

## After You've Made Changes

Once you've updated your files locally, commit and push:

```bash
git add .
git commit -m "Remove payment/subscription system - allow direct dashboard access"
git push
```

---

## Need Help?

If you're not sure which files to update, share the file and I'll provide the exact changes needed.
