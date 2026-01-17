// app/api/gocardless/create-subscription/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createSubscriptionFlow } from "@/lib/gocardless/subscription"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get plan from request body
    const body = await request.json()
    const { planId } = body

    if (!planId) {
      return NextResponse.json({ error: "Plan ID is required" }, { status: 400 })
    }

    // Create GoCardless billing request flow
    const { flowId, authorisationUrl } = await createSubscriptionFlow(user.id, planId)

    // Return the URL to redirect user to
    return NextResponse.json({
      success: true,
      flowId,
      redirectUrl: authorisationUrl,
    })
  } catch (error) {
    console.error("Error creating subscription:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create subscription" },
      { status: 500 },
    )
  }
}
