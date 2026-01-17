"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Moon, Sun, Monitor, User, Bell, Shield, Sparkles } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch by only rendering theme toggle after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="mt-2 text-muted-foreground">Manage your account preferences and settings</p>
        </div>

        {/* Appearance Settings */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-400 to-indigo-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Appearance</h2>
              <p className="text-sm text-muted-foreground">Customize how Finance.AI looks</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Theme</label>
              {mounted ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => setTheme("light")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-3 transition-colors ${
                      theme === "light"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Sun className="h-5 w-5" />
                    <span className="font-medium">Light</span>
                  </button>

                  <button
                    onClick={() => setTheme("dark")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-3 transition-colors ${
                      theme === "dark"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Moon className="h-5 w-5" />
                    <span className="font-medium">Dark</span>
                  </button>

                  <button
                    onClick={() => setTheme("system")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-3 transition-colors ${
                      theme === "system"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Monitor className="h-5 w-5" />
                    <span className="font-medium">System</span>
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <div className="flex flex-1 animate-pulse items-center justify-center rounded-lg border border-border bg-muted px-4 py-3">
                    <div className="h-5 w-20 rounded bg-muted-foreground/20" />
                  </div>
                  <div className="flex flex-1 animate-pulse items-center justify-center rounded-lg border border-border bg-muted px-4 py-3">
                    <div className="h-5 w-20 rounded bg-muted-foreground/20" />
                  </div>
                  <div className="flex flex-1 animate-pulse items-center justify-center rounded-lg border border-border bg-muted px-4 py-3">
                    <div className="h-5 w-20 rounded bg-muted-foreground/20" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-cyan-600">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Account</h2>
              <p className="text-sm text-muted-foreground">Manage your account information</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Email Notifications</label>
              <div className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Financial Updates</p>
                    <p className="text-sm text-muted-foreground">Get notified about your portfolio performance</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-border text-emerald-500 focus:ring-2 focus:ring-emerald-500"
                  defaultChecked
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Security</label>
              <div className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                </div>
                <button className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600">
                  Enable
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
            <p className="text-sm text-red-600/80 dark:text-red-400/80">Irreversible actions</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-red-500/20 bg-background px-4 py-3">
              <div>
                <p className="font-medium text-foreground">Delete Account</p>
                <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
              </div>
              <button className="rounded-lg border border-red-500 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-500 hover:text-white dark:text-red-400">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
