"use client"

import { useState } from "react"
import { Lock, Check, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SubscriptionGateProps {
  children: React.ReactNode
  hasActiveSubscription: boolean
}

const SUBSCRIPTION_PLANS = [
  {
    id: "basic",
    name: "Basic Plan",
    price: "5.99",
    paymentLink: "https://pay.gocardless.com/BRT000499T6GX9P",
    features: [
      "Full dashboard access",
      "Investment tracking",
      "Savings goals",
      "Transaction history",
    ],
  },
  {
    id: "premium",
    name: "Premium Plan",
    price: "16.99",
    paymentLink: "https://pay.gocardless.com/BRT000499THFG2E",
    features: [
      "Everything in Basic",
      "AI-powered insights",
      "Stock search",
      "AI financial advisor",
      "Priority support",
    ],
    popular: true,
  },
]

export function SubscriptionGate({ children, hasActiveSubscription }: SubscriptionGateProps) {
  const [selectedPlan, setSelectedPlan] = useState("premium")

  const handleSubscribe = () => {
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlan)
    if (plan) {
      window.location.href = plan.paymentLink
    }
  }

  if (hasActiveSubscription) {
    return <>{children}</>
  }

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-sm">{children}</div>

      <div className="absolute inset-0 flex items-center justify-center bg-background/95 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 py-8 text-center">
          <div className="mb-6 inline-flex items-center justify-center rounded-full bg-emerald-500/20 p-4">
            <Lock className="h-12 w-12 text-emerald-400" />
          </div>

          <h2 className="mb-3 text-3xl font-bold text-foreground">Subscribe to unlock your dashboard</h2>
          <p className="mb-10 text-lg text-muted-foreground">
            Choose a plan and start managing your finances with AI-powered insights
          </p>

          <div className="mb-8 grid gap-6 sm:grid-cols-2">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative rounded-2xl border-2 p-8 text-left transition-all ${
                  selectedPlan === plan.id
                    ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/20"
                    : "border-border bg-card hover:border-emerald-500/50"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-1 text-xs font-semibold text-white">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                {selectedPlan === plan.id && (
                  <div className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                  <div className="mt-4">
                    <span className="text-5xl font-bold text-foreground">£{plan.price}</span>
                    <span className="text-lg text-muted-foreground">/month</span>
                  </div>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Check className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>

          <Button
            onClick={handleSubscribe}
            size="lg"
            className="h-14 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-12 text-lg font-semibold text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/30"
          >
            Subscribe to {SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlan)?.name}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <p className="mt-6 text-sm text-muted-foreground">
            🔒 Secured by GoCardless • UK Direct Debit • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  )
}
