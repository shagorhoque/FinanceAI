// app/api/gocardless/callback/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { completeSubscription } from "@/lib/gocardless/subscription"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Get flow ID from query params
    const searchParams = request.nextUrl.searchParams
    const billingRequestFlowId = searchParams.get("redirect_flow_id")
    const planId = searchParams.get("plan") || "basic"

    if (!billingRequestFlowId) {
      return NextResponse.redirect(new URL("/dashboard?error=missing_flow_id", request.url))
    }

    // Complete the subscription
    await completeSubscription(billingRequestFlowId, user.id, planId)

    // Redirect to dashboard with success message
    return NextResponse.redirect(new URL("/dashboard?subscription=success", request.url))
  } catch (error) {
    console.error("Error completing subscription:", error)
    return NextResponse.redirect(
      new URL(
        `/dashboard?error=${encodeURIComponent(error instanceof Error ? error.message : "Failed to complete subscription")}`,
        request.url,
      ),
    )
  }
}
