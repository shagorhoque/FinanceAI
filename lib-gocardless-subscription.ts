// lib/gocardless/subscription.ts
import { gocardlessClient } from "./client"
import { createClient } from "@/lib/supabase/server"

export interface SubscriptionPlan {
  id: string
  name: string
  amount: number // in pence
  interval: "monthly" | "yearly"
  currency: string
}

// Define your subscription plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
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

/**
 * Create a GoCardless billing request flow
 * This generates a URL to redirect the user to GoCardless hosted pages
 */
export async function createSubscriptionFlow(userId: string, planId: string) {
  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId)
  if (!plan) {
    throw new Error("Invalid plan ID")
  }

  const supabase = await createClient()

  // Get user email
  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)

  if (userError || !userData.user) {
    throw new Error("User not found")
  }

  const userEmail = userData.user.email
  if (!userEmail) {
    throw new Error("User email not found")
  }

  // Create billing request flow
  const billingRequestFlow = await gocardlessClient.billingRequestFlows.create({
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/gocardless/callback`,
    exit_uri: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    links: {
      billing_request: (
        await gocardlessClient.billingRequests.create({
          mandate_request: {
            currency: plan.currency,
            scheme: "bacs", // UK Direct Debit
          },
          payment_request: {
            amount: plan.amount,
            currency: plan.currency,
            description: `${plan.name} - Monthly subscription`,
          },
        })
      ).id,
    },
    prefilled_customer: {
      email: userEmail,
    },
  })

  return {
    flowId: billingRequestFlow.id,
    authorisationUrl: billingRequestFlow.authorisation_url,
  }
}

/**
 * Complete subscription after user completes GoCardless flow
 */
export async function completeSubscription(billingRequestFlowId: string, userId: string, planId: string) {
  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId)
  if (!plan) {
    throw new Error("Invalid plan ID")
  }

  // Get the billing request flow
  const flow = await gocardlessClient.billingRequestFlows.get(billingRequestFlowId)

  if (!flow.links.billing_request) {
    throw new Error("No billing request linked to flow")
  }

  // Get the billing request
  const billingRequest = await gocardlessClient.billingRequests.get(flow.links.billing_request)

  if (!billingRequest.links.customer || !billingRequest.links.mandate_request_mandate) {
    throw new Error("Billing request not completed")
  }

  const customerId = billingRequest.links.customer
  const mandateId = billingRequest.links.mandate_request_mandate

  // Create subscription
  const subscription = await gocardlessClient.subscriptions.create({
    amount: plan.amount,
    currency: plan.currency,
    name: plan.name,
    interval_unit: plan.interval === "monthly" ? "monthly" : "yearly",
    links: {
      mandate: mandateId,
    },
    metadata: {
      user_id: userId,
      plan_id: planId,
    },
  })

  // Store in database
  const supabase = await createClient()

  const { error } = await supabase.from("subscriptions").upsert({
    user_id: userId,
    gocardless_customer_id: customerId,
    gocardless_mandate_id: mandateId,
    gocardless_subscription_id: subscription.id,
    subscription_status: subscription.status === "active" ? "active" : "pending",
    plan: planId,
    amount_in_pence: plan.amount,
    currency: plan.currency,
    started_at: subscription.created_at,
    next_payment_date: subscription.upcoming_payments?.[0]?.charge_date || null,
  })

  if (error) {
    throw new Error(`Failed to save subscription: ${error.message}`)
  }

  return subscription
}

/**
 * Check if user has active subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("subscriptions")
    .select("subscription_status")
    .eq("user_id", userId)
    .maybeSingle()

  if (error || !data) {
    return false
  }

  return data.subscription_status === "active"
}

/**
 * Get user subscription details
 */
export async function getUserSubscription(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.from("subscriptions").select("*").eq("user_id", userId).maybeSingle()

  if (error) {
    throw new Error(`Failed to get subscription: ${error.message}`)
  }

  return data
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(userId: string) {
  const subscription = await getUserSubscription(userId)

  if (!subscription?.gocardless_subscription_id) {
    throw new Error("No active subscription found")
  }

  // Cancel in GoCardless
  await gocardlessClient.subscriptions.cancel(subscription.gocardless_subscription_id)

  // Update database
  const supabase = await createClient()

  const { error } = await supabase
    .from("subscriptions")
    .update({
      subscription_status: "cancelled",
      cancelled_at: new Date().toISOString(),
    })
    .eq("user_id", userId)

  if (error) {
    throw new Error(`Failed to update subscription: ${error.message}`)
  }
}
