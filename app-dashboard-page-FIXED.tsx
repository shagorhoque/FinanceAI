"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { SubscriptionGate } from "@/components/subscription-gate"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean | null>(null)
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true)

  useEffect(() => {
    checkSubscriptionStatus()
  }, [])

  const checkSubscriptionStatus = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setHasActiveSubscription(false)
        setIsCheckingSubscription(false)
        return
      }

      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("subscription_status")
        .eq("user_id", user.id)
        .maybeSingle()

      setHasActiveSubscription(subscription?.subscription_status === "active")
    } catch (error) {
      console.error("Error checking subscription:", error)
      setHasActiveSubscription(false)
    } finally {
      setIsCheckingSubscription(false)
    }
  }

  if (isCheckingSubscription) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-emerald-500" />
            <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <SubscriptionGate hasActiveSubscription={hasActiveSubscription ?? false}>
        <div className="space-y-8">
          <div className="rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 p-8">
            <h1 className="text-4xl font-bold text-white">Welcome to Your Dashboard</h1>
            <p className="mt-3 text-lg text-slate-300">
              Track your wealth, manage investments, and get AI-powered financial advice.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-sm font-medium text-muted-foreground">Net Worth</h3>
              <p className="mt-2 text-3xl font-bold text-foreground">£0</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-sm font-medium text-muted-foreground">Investments</h3>
              <p className="mt-2 text-3xl font-bold text-foreground">£0</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-sm font-medium text-muted-foreground">Savings</h3>
              <p className="mt-2 text-3xl font-bold text-foreground">£0</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-sm font-medium text-muted-foreground">Monthly Spending</h3>
              <p className="mt-2 text-3xl font-bold text-foreground">£0</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-8">
            <h2 className="text-2xl font-bold text-foreground">Portfolio Overview</h2>
            <p className="mt-2 text-muted-foreground">Your investment performance at a glance</p>
            <div className="mt-6 flex h-64 items-center justify-center rounded-lg bg-muted">
              <p className="text-muted-foreground">Chart will appear here</p>
            </div>
          </div>
        </div>
      </SubscriptionGate>
    </DashboardLayout>
  )
}
