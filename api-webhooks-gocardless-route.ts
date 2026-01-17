// app/api/webhooks/gocardless/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

// Use service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

/**
 * Verify GoCardless webhook signature
 */
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex")
  return signature === expectedSignature
}

/**
 * Handle GoCardless webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.GOCARDLESS_WEBHOOK_SECRET

    if (!webhookSecret) {
      console.error("GOCARDLESS_WEBHOOK_SECRET not configured")
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
    }

    // Get raw body for signature verification
    const payload = await request.text()
    const signature = request.headers.get("webhook-signature")

    if (!signature) {
      console.error("Missing webhook signature")
      return NextResponse.json({ error: "Missing signature" }, { status: 401 })
    }

    // Verify signature
    if (!verifyWebhookSignature(payload, signature, webhookSecret)) {
      console.error("Invalid webhook signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    // Parse the payload
    const data = JSON.parse(payload)
    const events = data.events

    // Process each event
    for (const event of events) {
      console.log("Processing GoCardless event:", event.resource_type, event.action)

      switch (event.resource_type) {
        case "subscriptions":
          await handleSubscriptionEvent(event)
          break

        case "payments":
          await handlePaymentEvent(event)
          break

        case "mandates":
          await handleMandateEvent(event)
          break

        default:
          console.log("Unhandled event type:", event.resource_type)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook processing failed" },
      { status: 500 },
    )
  }
}

/**
 * Handle subscription events
 */
async function handleSubscriptionEvent(event: any) {
  const subscriptionId = event.links.subscription
  const action = event.action

  // Get subscription from database
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("gocardless_subscription_id", subscriptionId)
    .single()

  if (!subscription) {
    console.log("Subscription not found in database:", subscriptionId)
    return
  }

  switch (action) {
    case "created":
      await supabase
        .from("subscriptions")
        .update({
          subscription_status: "active",
          started_at: new Date().toISOString(),
        })
        .eq("gocardless_subscription_id", subscriptionId)
      break

    case "payment_created":
      // Payment has been scheduled
      console.log("Payment created for subscription:", subscriptionId)
      break

    case "cancelled":
      await supabase
        .from("subscriptions")
        .update({
          subscription_status: "cancelled",
          cancelled_at: new Date().toISOString(),
        })
        .eq("gocardless_subscription_id", subscriptionId)
      break

    case "finished":
      await supabase
        .from("subscriptions")
        .update({
          subscription_status: "expired",
        })
        .eq("gocardless_subscription_id", subscriptionId)
      break

    default:
      console.log("Unhandled subscription action:", action)
  }
}

/**
 * Handle payment events
 */
async function handlePaymentEvent(event: any) {
  const paymentId = event.links.payment
  const action = event.action
  const subscriptionId = event.links.subscription

  switch (action) {
    case "confirmed":
      // Payment succeeded
      if (subscriptionId) {
        await supabase
          .from("subscriptions")
          .update({
            subscription_status: "active",
          })
          .eq("gocardless_subscription_id", subscriptionId)
      }
      console.log("Payment confirmed:", paymentId)
      break

    case "failed":
      // Payment failed
      if (subscriptionId) {
        await supabase
          .from("subscriptions")
          .update({
            subscription_status: "past_due",
          })
          .eq("gocardless_subscription_id", subscriptionId)
      }
      console.log("Payment failed:", paymentId)
      break

    case "paid_out":
      // Payment has been paid out to your bank account
      console.log("Payment paid out:", paymentId)
      break

    default:
      console.log("Unhandled payment action:", action)
  }
}

/**
 * Handle mandate events
 */
async function handleMandateEvent(event: any) {
  const mandateId = event.links.mandate
  const action = event.action

  switch (action) {
    case "created":
      console.log("Mandate created:", mandateId)
      break

    case "submitted":
      console.log("Mandate submitted to bank:", mandateId)
      break

    case "active":
      console.log("Mandate activated:", mandateId)
      break

    case "cancelled":
      // Mandate cancelled - cancel associated subscriptions
      await supabase
        .from("subscriptions")
        .update({
          subscription_status: "cancelled",
          cancelled_at: new Date().toISOString(),
        })
        .eq("gocardless_mandate_id", mandateId)
      console.log("Mandate cancelled:", mandateId)
      break

    case "failed":
      // Mandate failed
      await supabase
        .from("subscriptions")
        .update({
          subscription_status: "cancelled",
        })
        .eq("gocardless_mandate_id", mandateId)
      console.log("Mandate failed:", mandateId)
      break

    default:
      console.log("Unhandled mandate action:", action)
  }
}
