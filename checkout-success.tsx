"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle, Sparkles, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const [isVerifying, setIsVerifying] = useState(true)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    let attempts = 0
    const maxAttempts = 10

    const checkSubscription = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("status, plan")
        .eq("user_id", user.id)
        .maybeSingle()

      if (subscription && (subscription.status === "active" || subscription.status === "trialing")) {
        setIsVerifying(false)
        setIsReady(true)
        return true
      }

      attempts++
      if (attempts < maxAttempts) {
        // Wait 2 seconds and try again
        setTimeout(checkSubscription, 2000)
      } else {
        // After max attempts, allow manual navigation
        setIsVerifying(false)
        setIsReady(true)
      }

      return false
    }

    checkSubscription()
  }, [router])

  const handleGoToDashboard = () => {
    // Use Next.js router for client-side navigation instead of window.location.href
    // This prevents triggering middleware that might redirect back to subscription
    router.push("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f1729] px-4">
      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 pointer-events-none" />

      <div className="relative text-center">
        {/* Success Icon */}
        <div className="mb-6 inline-flex items-center justify-center rounded-full bg-emerald-500/20 p-4">
          <CheckCircle className="h-16 w-16 text-emerald-400" />
        </div>

        {/* Logo */}
        <Link href="/" className="mb-8 inline-flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Finance.AI</span>
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-white">Payment Successful!</h1>
        <p className="mt-4 max-w-md text-lg text-slate-400">
          Thank you for subscribing to Finance.AI. Your account has been upgraded and you now have full access to all
          features.
        </p>

        <div className="mt-8">
          {isVerifying ? (
            <Button disabled className="h-12 rounded-xl bg-slate-700 px-8 font-semibold text-white">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying subscription...
            </Button>
          ) : (
            <Button
              onClick={handleGoToDashboard}
              className="h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 font-semibold text-white hover:from-emerald-600 hover:to-teal-600"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {isVerifying && <p className="mt-6 text-sm text-slate-500">Setting up your account...</p>}
      </div>
    </div>
  )
}
