// app/activate/page.tsx
// Copy this ENTIRE file to: app/activate/page.tsx
// This allows users to manually activate their subscription after payment

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, Loader2, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function ActivatePage() {
  const router = useRouter()
  const [isActivating, setIsActivating] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleActivate = async () => {
    setIsActivating(true)
    setMessage("")
    setError("")

    try {
      const supabase = createClient()

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        setError("Please log in first")
        setIsActivating(false)
        return
      }

      // Manually activate subscription (useful if webhook didn't fire)
      const { error: updateError } = await supabase
        .from("subscriptions")
        .upsert({
          user_id: user.id,
          subscription_status: "active",
          plan: "basic", // Default to basic, webhook will update if premium
          started_at: new Date().toISOString(),
        })

      if (updateError) {
        setError("Failed to activate subscription")
        console.error(updateError)
      } else {
        setMessage("Subscription activated successfully!")
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      }
    } catch (err) {
      setError("An error occurred")
      console.error(err)
    } finally {
      setIsActivating(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8 inline-flex items-center justify-center rounded-full bg-emerald-500/20 p-6">
          <CheckCircle className="h-16 w-16 text-emerald-400" />
        </div>

        <h1 className="mb-4 text-3xl font-bold text-white">Activate Your Subscription</h1>
        <p className="mb-8 text-slate-300">
          Click the button below to activate your subscription and unlock full access to your dashboard.
        </p>

        {message && (
          <div className="mb-6 rounded-xl bg-emerald-500/20 p-4 text-emerald-400">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl bg-red-500/20 p-4 text-red-400">
            {error}
          </div>
        )}

        <button
          onClick={handleActivate}
          disabled={isActivating}
          className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50"
        >
          {isActivating ? (
            <>
              <Loader2 className="mr-2 inline-block h-5 w-5 animate-spin" />
              Activating...
            </>
          ) : (
            "Activate Subscription"
          )}
        </button>

        <p className="mt-6 text-sm text-slate-400">
          Already activated?{" "}
          <a href="/dashboard" className="text-emerald-400 hover:text-emerald-300">
            Go to Dashboard
          </a>
        </p>
      </div>
    </div>
  )
}
