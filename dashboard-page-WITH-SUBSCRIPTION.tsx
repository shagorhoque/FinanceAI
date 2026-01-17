// app/dashboard/page.tsx
"use client"

import { useState, useMemo, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StatCard } from "@/components/stat-card"
import { PortfolioChart } from "@/components/portfolio-chart"
import { SpendingChart } from "@/components/spending-chart"
import { TransactionModal } from "@/components/modals/transaction-modal"
import { InvestmentModal } from "@/components/modals/investment-modal"
import { SavingsGoalModal } from "@/components/modals/savings-goal-modal"
import { SubscriptionGate } from "@/components/subscription-gate"
import { useFinanceStore } from "@/lib/finance-store"
import Image from "next/image"
import { Wallet, TrendingUp, Target, CreditCard, Loader2 } from "lucide-react"

export default function DashboardPage() {
  const { transactions, investments, savingsGoals } = useFinanceStore()
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean | null>(null)
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true)

  const [transactionModalOpen, setTransactionModalOpen] = useState(false)
  const [investmentModalOpen, setInvestmentModalOpen] = useState(false)
  const [savingsModalOpen, setSavingsModalOpen] = useState(false)

  // Check subscription status on mount
  useEffect(() => {
    checkSubscriptionStatus()
  }, [])

  const checkSubscriptionStatus = async () => {
    try {
      const response = await fetch("/api/gocardless/check-status")
      if (response.ok) {
        const data = await response.json()
        setHasActiveSubscription(data.hasActiveSubscription)
      } else {
        setHasActiveSubscription(false)
      }
    } catch (error) {
      console.error("Error checking subscription:", error)
      setHasActiveSubscription(false)
    } finally {
      setIsCheckingSubscription(false)
    }
  }

  const totals = useMemo(() => {
    const totalInvestments = investments.reduce((sum, inv) => sum + inv.amount, 0)
    const totalSavings = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0)
    const activeGoals = savingsGoals.length

    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const monthlySpending = transactions
      .filter((t) => {
        const date = new Date(t.date)
        return t.type === "expense" && date.getMonth() === currentMonth && date.getFullYear() === currentYear
      })
      .reduce((sum, t) => sum + t.amount, 0)

    const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
    const netWorth = totalInvestments + totalSavings + (totalIncome - totalExpenses)

    return { totalInvestments, totalSavings, activeGoals, monthlySpending, netWorth }
  }, [transactions, investments, savingsGoals])

  // Show loading state while checking subscription
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
        <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 p-6">
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white">Welcome to Your Dashboard</h1>
              <p className="mt-2 text-lg text-slate-300">
                Track your wealth, manage investments, and get AI-powered financial advice.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1">
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-sm text-emerald-400">Portfolio Up 12%</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1">
                  <div className="h-2 w-2 rounded-full bg-blue-400" />
                  <span className="text-sm text-blue-400">3 Goals Active</span>
                </div>
              </div>
            </div>
            <div className="relative h-32 w-48 flex-shrink-0 md:h-40 md:w-60">
              <Image
                src="/images/finance-illustration.jpg"
                alt="Financial growth illustration"
                fill
                className="rounded-xl object-cover"
              />
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">Financial Overview</h2>
          <p className="mt-1 text-muted-foreground">Your financial snapshot at a glance</p>
        </div>

        {/* Stat Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Net Worth"
            value={`£${totals.netWorth.toFixed(0)}`}
            icon={Wallet}
            iconGradient="bg-gradient-to-br from-green-400 to-emerald-600"
            buttonText="Add Transaction"
            buttonVariant="primary"
            onButtonClick={() => setTransactionModalOpen(true)}
          />
          <StatCard
            title="Investments"
            value={`£${totals.totalInvestments.toFixed(0)}`}
            icon={TrendingUp}
            iconGradient="bg-gradient-to-br from-blue-400 to-indigo-600"
            buttonText="Add Investment"
            onButtonClick={() => setInvestmentModalOpen(true)}
          />
          <StatCard
            title="Savings Progress"
            value={`£${totals.totalSavings.toFixed(0)}`}
            subtitle={`${totals.activeGoals} active goals`}
            icon={Target}
            iconGradient="bg-gradient-to-br from-purple-400 to-violet-600"
            buttonText="Add Goal"
            onButtonClick={() => setSavingsModalOpen(true)}
          />
          <StatCard
            title="Monthly Spending"
            value={`£${totals.monthlySpending.toFixed(0)}`}
            icon={CreditCard}
            iconGradient="bg-gradient-to-br from-orange-400 to-amber-500"
            buttonText="Add Transaction"
            buttonVariant="primary"
            onButtonClick={() => setTransactionModalOpen(true)}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PortfolioChart />
          <SpendingChart />
        </div>

        {/* Modals */}
        <TransactionModal open={transactionModalOpen} onClose={() => setTransactionModalOpen(false)} />
        <InvestmentModal open={investmentModalOpen} onClose={() => setInvestmentModalOpen(false)} />
        <SavingsGoalModal open={savingsModalOpen} onClose={() => setSavingsModalOpen(false)} />
      </SubscriptionGate>
    </DashboardLayout>
  )
}
