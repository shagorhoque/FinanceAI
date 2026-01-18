// components/subscription-gate.tsx
// Copy this ENTIRE file to: components/subscription-gate.tsx

"use client"

import { Lock, Check, ArrowRight } from "lucide-react"

interface SubscriptionGateProps {
  children: React.ReactNode
  hasActiveSubscription: boolean
}

export function SubscriptionGate({ children, hasActiveSubscription }: SubscriptionGateProps) {
  const handleSubscribe = (paymentLink: string) => {
    // Redirect directly to GoCardless payment page
    window.location.href = paymentLink
  }

  // If user has active subscription, show content
  if (hasActiveSubscription) {
    return <>{children}</>
  }

  // Otherwise show subscription gate
  return (
    <div className="relative min-h-screen">
      {/* Blurred content in background */}
      <div className="pointer-events-none select-none blur-md opacity-50">{children}</div>

      {/* Subscription overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-12">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="mb-6 inline-flex items-center justify-center rounded-full bg-emerald-500/20 p-6">
              <Lock className="h-16 w-16 text-emerald-400" />
            </div>
            <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
              Unlock Your Financial Dashboard
            </h1>
            <p className="text-xl text-slate-300">
              Choose a plan to access all features and start managing your finances with AI-powered insights
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
            {/* Basic Plan - £5.99 */}
            <div className="group relative overflow-hidden rounded-3xl border-2 border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-8 transition-all hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/20">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white">Basic Plan</h3>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-6xl font-bold text-emerald-400">£5.99</span>
                  <span className="text-xl text-slate-400">/month</span>
                </div>
              </div>

              <ul className="mb-8 space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="mt-1 h-6 w-6 flex-shrink-0 text-emerald-400" />
                  <span className="text-slate-300">Full dashboard access</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-1 h-6 w-6 flex-shrink-0 text-emerald-400" />
                  <span className="text-slate-300">Investment tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-1 h-6 w-6 flex-shrink-0 text-emerald-400" />
                  <span className="text-slate-300">Savings goals management</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-1 h-6 w-6 flex-shrink-0 text-emerald-400" />
                  <span className="text-slate-300">Transaction history</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-1 h-6 w-6 flex-shrink-0 text-emerald-400" />
                  <span className="text-slate-300">Financial reports</span>
                </li>
              </ul>

              <button
                onClick={() => handleSubscribe("https://pay.gocardless.com/BRT000499T6GX9P")}
                className="w-full rounded-xl bg-gradient-to-r from-slate-700 to-slate-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:from-slate-600 hover:to-slate-500 hover:shadow-lg"
              >
                Subscribe to Basic
                <ArrowRight className="ml-2 inline-block h-5 w-5" />
              </button>

              <p className="mt-4 text-center text-sm text-slate-400">
                Perfect for getting started
              </p>
            </div>

            {/* Premium Plan - £16.99 */}
            <div className="group relative overflow-hidden rounded-3xl border-2 border-emerald-500 bg-gradient-to-br from-slate-800 to-slate-900 p-8 shadow-2xl shadow-emerald-500/30 transition-all hover:shadow-emerald-500/50">
              {/* Popular badge */}
              <div className="absolute -right-12 top-8 rotate-45 bg-gradient-to-r from-emerald-500 to-teal-500 px-12 py-2 text-xs font-bold text-white shadow-lg">
                MOST POPULAR
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white">Premium Plan</h3>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-6xl font-bold text-emerald-400">£16.99</span>
                  <span className="text-xl text-slate-400">/month</span>
                </div>
              </div>

              <ul className="mb-8 space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="mt-1 h-6 w-6 flex-shrink-0 text-emerald-400" />
                  <span className="font-semibold text-white">Everything in Basic, plus:</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-1 h-6 w-6 flex-shrink-0 text-emerald-400" />
                  <span className="text-slate-300">AI-powered financial insights</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-1 h-6 w-6 flex-shrink-0 text-emerald-400" />
                  <span className="text-slate-300">AI financial advisor chat</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-1 h-6 w-6 flex-shrink-0 text-emerald-400" />
                  <span className="text-slate-300">Advanced stock search</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-1 h-6 w-6 flex-shrink-0 text-emerald-400" />
                  <span className="text-slate-300">Portfolio optimization</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-1 h-6 w-6 flex-shrink-0 text-emerald-400" />
                  <span className="text-slate-300">Priority support</span>
                </li>
              </ul>

              <button
                onClick={() => handleSubscribe("https://pay.gocardless.com/BRT000499THFG2E")}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-emerald-500/50 transition-all hover:from-emerald-600 hover:to-teal-600 hover:shadow-xl hover:shadow-emerald-500/60"
              >
                Subscribe to Premium
                <ArrowRight className="ml-2 inline-block h-5 w-5" />
              </button>

              <p className="mt-4 text-center text-sm text-emerald-400">
                Best value for serious investors
              </p>
            </div>
          </div>

          {/* Footer info */}
          <div className="mt-12 text-center">
            <p className="text-slate-400">
              🔒 Secured by GoCardless • UK Direct Debit • Cancel anytime • No commitment
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
