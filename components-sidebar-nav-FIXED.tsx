"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  TrendingUp,
  PiggyBank,
  Receipt,
  LineChart,
  Sparkles,
  Settings,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/investments", label: "Investments", icon: TrendingUp },
  { href: "/savings", label: "Savings", icon: PiggyBank },
  { href: "/transactions", label: "Transactions", icon: Receipt },
  { href: "/stock-search", label: "Stock Search", icon: LineChart },
  { href: "/ai-advisor", label: "AI Advisor", icon: Sparkles },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function SidebarNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-emerald-900/30 bg-gradient-to-b from-black via-[#071207] to-[#0a1a0a]">
      <div className="flex items-center gap-3 border-b border-emerald-900/30 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-600">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-semibold text-white">Finance.AI</h1>
          <p className="text-xs text-emerald-400">Financial Advisor</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-300",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-emerald-900/30 px-3 py-4">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-emerald-500/10 hover:text-emerald-300"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
