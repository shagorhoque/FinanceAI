// app/api/webhooks/gocardless/route.ts
// Copy this ENTIRE file to: app/api/webhooks/gocardless/route.ts

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Use service role for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log("GoCardless webhook received")

    const body = await request.json()
    const events = body.events || []

    for (const event of events) {
      console.log("Processing event:", event.resource_type, event.action)

      // Handle subscription events
      if (event.resource_type === "subscriptions") {
        await handleSubscriptionEvent(event)
      }

      // Handle payment events
      if (event.resource_type === "payments") {
        await handlePaymentEvent(event)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}

async function handleSubscriptionEvent(event: any) {
  const subscriptionId = event.links?.subscription
  const customerId = event.links?.customer
  const action = event.action

  console.log(`Subscription ${action}:`, subscriptionId)

  if (!subscriptionId) return

  // Get customer email from metadata
  const customerEmail = event.metadata?.customer_email

  if (action === "created" || action === "confirmed") {
    // Determine plan based on amount
    const amount = parseInt(event.metadata?.amount || "0")
    let plan = "basic"

    if (amount >= 1699) {
      plan = "premium" // £16.99
    } else if (amount >= 599) {
      plan = "basic" // £5.99
    }

    // Find user by email
    let userId = null
    if (customerEmail) {
      const { data: authUser } = await supabase.auth.admin.listUsers()
      const user = authUser.users?.find(u => u.email === customerEmail)
      userId = user?.id
    }

    // Create/update subscription
    if (userId) {
      await supabase.from("subscriptions").upsert({
        user_id: userId,
        gocardless_subscription_id: subscriptionId,
        gocardless_customer_id: customerId,
        subscription_status: "active",
        plan: plan,
        amount_in_pence: amount,
        currency: "GBP",
        started_at: new Date().toISOString(),
      })

      console.log(`Subscription activated for user ${userId}`)
    }
  } else if (action === "cancelled" || action === "finished") {
    // Cancel subscription
    await supabase
      .from("subscriptions")
      .update({
        subscription_status: "cancelled",
        cancelled_at: new Date().toISOString(),
      })
      .eq("gocardless_subscription_id", subscriptionId)

    console.log(`Subscription cancelled: ${subscriptionId}`)
  }
}

async function handlePaymentEvent(event: any) {
  const paymentId = event.links?.payment
  const subscriptionId = event.links?.subscription
  const action = event.action

  console.log(`Payment ${action}:`, paymentId)

  if (action === "confirmed" && subscriptionId) {
    // Payment successful - ensure subscription is active
    await supabase
      .from("subscriptions")
      .update({ subscription_status: "active" })
      .eq("gocardless_subscription_id", subscriptionId)

    console.log(`Payment confirmed for subscription ${subscriptionId}`)
  } else if (action === "failed" && subscriptionId) {
    // Payment failed
    await supabase
      .from("subscriptions")
      .update({ subscription_status: "past_due" })
      .eq("gocardless_subscription_id", subscriptionId)

    console.log(`Payment failed for subscription ${subscriptionId}`)
  }
}
