// app/api/gocardless/check-status/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getUserSubscription } from "@/lib/gocardless/subscription"

export async function GET(request: NextRequest) {
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

    // Get subscription from database
    const subscription = await getUserSubscription(user.id)

    return NextResponse.json({
      hasActiveSubscription: subscription?.subscription_status === "active",
      subscription,
    })
  } catch (error) {
    console.error("Error checking subscription:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to check subscription" },
      { status: 500 },
    )
  }
}
