// app/dashboard/page.tsx
// Copy this ENTIRE file to: app/dashboard/page.tsx

"use client"

import { useEffect, useState } from "react"
import { Loader2, TrendingUp, Wallet, Target, CreditCard } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { DashboardLayout } from "@/components/dashboard-layout"
import { SubscriptionGate } from "@/components/subscription-gate"

export default function DashboardPage() {
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkSubscription()
  }, [])

  const checkSubscription = async () => {
    try {
      const supabase = createClient()

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        setHasActiveSubscription(false)
        setIsLoading(false)
        return
      }

      // Check subscription status
      const { data: subscription, error: subError } = await supabase
        .from("subscriptions")
        .select("subscription_status")
        .eq("user_id", user.id)
        .maybeSingle()

      if (subError) {
        console.error("Error checking subscription:", subError)
        setHasActiveSubscription(false)
      } else {
        setHasActiveSubscription(subscription?.subscription_status === "active")
      }
    } catch (error) {
      console.error("Error:", error)
      setHasActiveSubscription(false)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-emerald-500" />
            <p className="mt-4 text-lg text-slate-400">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <SubscriptionGate hasActiveSubscription={hasActiveSubscription ?? false}>
        <div className="space-y-8">
          {/* Welcome Header */}
          <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 p-8 shadow-2xl">
            <h1 className="text-4xl font-bold text-white">Welcome to Your Dashboard</h1>
            <p className="mt-3 text-xl text-emerald-100">
              Track your wealth, manage investments, and get AI-powered financial advice
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Net Worth */}
            <div className="group rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-6 transition-all hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-400">Net Worth</h3>
                <div className="rounded-lg bg-emerald-500/20 p-2">
                  <Wallet className="h-5 w-5 text-emerald-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white">£0</p>
              <p className="mt-2 text-sm text-emerald-400">+0% this month</p>
            </div>

            {/* Investments */}
            <div className="group rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-6 transition-all hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-400">Investments</h3>
                <div className="rounded-lg bg-blue-500/20 p-2">
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white">£0</p>
              <p className="mt-2 text-sm text-blue-400">0 assets</p>
            </div>

            {/* Savings */}
            <div className="group rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-6 transition-all hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-400">Savings Goals</h3>
                <div className="rounded-lg bg-purple-500/20 p-2">
                  <Target className="h-5 w-5 text-purple-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white">£0</p>
              <p className="mt-2 text-sm text-purple-400">0 active goals</p>
            </div>

            {/* Monthly Spending */}
            <div className="group rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-6 transition-all hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/20">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-400">Monthly Spending</h3>
                <div className="rounded-lg bg-orange-500/20 p-2">
                  <CreditCard className="h-5 w-5 text-orange-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white">£0</p>
              <p className="mt-2 text-sm text-orange-400">0 transactions</p>
            </div>
          </div>

          {/* Portfolio Overview */}
          <div className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-8">
            <h2 className="mb-6 text-2xl font-bold text-white">Portfolio Overview</h2>
            <div className="flex h-64 items-center justify-center rounded-xl bg-slate-800/50">
              <p className="text-slate-400">Your portfolio chart will appear here</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-8">
            <h2 className="mb-6 text-2xl font-bold text-white">Recent Activity</h2>
            <div className="flex h-48 items-center justify-center rounded-xl bg-slate-800/50">
              <p className="text-slate-400">Your recent transactions will appear here</p>
            </div>
          </div>
        </div>
      </SubscriptionGate>
    </DashboardLayout>
  )
}
