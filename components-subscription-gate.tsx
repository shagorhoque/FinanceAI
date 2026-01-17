// components/subscription-gate.tsx
"use client"

import { useState } from "react"
import { Lock, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SUBSCRIPTION_PLANS } from "@/lib/gocardless/subscription"

interface SubscriptionGateProps {
  children: React.ReactNode
  hasActiveSubscription: boolean
}

export function SubscriptionGate({ children, hasActiveSubscription }: SubscriptionGateProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState("basic")

  const handleSubscribe = async () => {
    setIsLoading(true)

    try {
      // Call API to create subscription flow
      const response = await fetch("/api/gocardless/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId: selectedPlan }),
      })

      if (!response.ok) {
        throw new Error("Failed to create subscription")
      }

      const data = await response.json()

      // Redirect to GoCardless hosted page
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
      }
    } catch (error) {
      console.error("Error subscribing:", error)
      alert("Failed to start subscription. Please try again.")
      setIsLoading(false)
    }
  }

  // If user has active subscription, show content normally
  if (hasActiveSubscription) {
    return <>{children}</>
  }

  // Otherwise, show paywall
  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="pointer-events-none select-none blur-sm">{children}</div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 text-center">
          {/* Lock Icon */}
          <div className="mb-6 inline-flex items-center justify-center rounded-full bg-emerald-500/20 p-4">
            <Lock className="h-12 w-12 text-emerald-400" />
          </div>

          {/* Message */}
          <h2 className="mb-3 text-3xl font-bold text-foreground">You need a subscription to access this dashboard</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Subscribe now to unlock all features and start managing your finances with AI-powered insights.
          </p>

          {/* Pricing Cards */}
          <div className="mb-8 grid gap-6 sm:grid-cols-2">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative rounded-2xl border-2 p-6 text-left transition-all ${
                  selectedPlan === plan.id
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-border bg-card hover:border-emerald-500/50"
                }`}
              >
                {/* Selected indicator */}
                {selectedPlan === plan.id && (
                  <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-4xl font-bold text-foreground">£{(plan.amount / 100).toFixed(2)}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>

                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-emerald-500" />
                    Full dashboard access
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-emerald-500" />
                    Investment tracking
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-emerald-500" />
                    Savings goals
                  </li>
                  {plan.id === "premium" && (
                    <>
                      <li className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-emerald-500" />
                        AI-powered insights
                      </li>
                      <li className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-emerald-500" />
                        Priority support
                      </li>
                    </>
                  )}
                </ul>
              </button>
            ))}
          </div>

          {/* Subscribe Button */}
          <Button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="h-14 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-12 text-lg font-semibold text-white hover:from-emerald-600 hover:to-teal-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Starting subscription...
              </>
            ) : (
              `Subscribe to ${SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlan)?.name}`
            )}
          </Button>

          <p className="mt-4 text-sm text-muted-foreground">
            Secured by GoCardless • UK Direct Debit • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  )
}
