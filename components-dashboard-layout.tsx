"use client"

import { ReactNode } from "react"
import { SidebarNav } from "@/components/sidebar-nav"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <main className="flex-1 pl-64">
        <div className="container py-8">{children}</div>
      </main>
    </div>
  )
}
