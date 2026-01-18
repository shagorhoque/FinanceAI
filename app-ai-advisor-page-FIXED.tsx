// app/ai-advisor/page.tsx
"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { SubscriptionGate } from "@/components/subscription-gate"
import { ChatInterface } from "@/components/chat-interface"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Sparkles, Brain, TrendingUp, Target } from "lucide-react"

export default function AIAdvisorPage() {
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkSubscription()
  }, [])

  const checkSubscription = async () => {
    try {
      const supabase = createClient()
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        setHasActiveSubscription(false)
        setIsLoading(false)
        return
      }

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
            <p className="mt-4 text-lg text-slate-400">Loading AI Advisor...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <SubscriptionGate hasActiveSubscription={hasActiveSubscription ?? false}>
        <div className="space-y-8">
          {/* Header */}
          <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600 p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="rounded-full bg-white/20 p-3">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">AI Financial Advisor</h1>
                <p className="text-xl text-purple-100">
                  Get personalized financial advice powered by artificial intelligence
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/20">
                <Sparkles className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Smart Insights</h3>
              <p className="text-sm text-slate-400">
                Get AI-powered recommendations tailored to your financial goals
              </p>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20">
                <TrendingUp className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Investment Strategies</h3>
              <p className="text-sm text-slate-400">
                Learn about investment opportunities and portfolio optimization
              </p>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/20">
                <Target className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Goal Planning</h3>
              <p className="text-sm text-slate-400">
                Create and track financial goals with AI-assisted planning
              </p>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-6">
            <h2 className="mb-6 text-2xl font-bold text-white">Chat with Your AI Advisor</h2>
            <ChatInterface />
          </div>

          {/* Tips */}
          <div className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-6">
            <h3 className="mb-4 text-xl font-semibold text-white">Try asking about:</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg bg-slate-700/50 p-4">
                <p className="text-sm text-slate-300">• Investment strategies for beginners</p>
              </div>
              <div className="rounded-lg bg-slate-700/50 p-4">
                <p className="text-sm text-slate-300">• How to create a budget</p>
              </div>
              <div className="rounded-lg bg-slate-700/50 p-4">
                <p className="text-sm text-slate-300">• Retirement planning advice</p>
              </div>
              <div className="rounded-lg bg-slate-700/50 p-4">
                <p className="text-sm text-slate-300">• Tax optimization strategies</p>
              </div>
            </div>
          </div>
        </div>
      </SubscriptionGate>
    </DashboardLayout>
  )
}
