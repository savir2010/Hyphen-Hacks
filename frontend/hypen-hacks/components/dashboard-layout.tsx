"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-guard"
import { NotificationBell } from "@/components/notification-bell"
import { Bone as Drone, Map, Video, Activity, LogOut, Menu, Shield, Users, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname() // Added to track current page

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Activity, current: pathname === "/dashboard" },
    { name: "Map", href: "/map", icon: Map, current: pathname === "/map" },
    { name: "Feeds", href: "/feeds", icon: Video, current: pathname === "/feeds" },
    { name: "Telemetry", href: "/telemetry", icon: Drone, current: pathname === "/telemetry" },
    { name: "Coordination", href: "/coordination", icon: Shield, current: pathname === "/coordination" },
    { name: "Personnel", href: "/personnel", icon: Users, current: pathname === "/personnel" },
  ]

  const handleAddDrone = () => {
    console.log("[v0] Add new drone functionality triggered")
    // This would open a modal or navigate to add drone page
    alert("Add Drone feature - This would open a drone registration form")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border">
            <SidebarContent navigation={navigation} user={user} logout={logout} onAddDrone={handleAddDrone} />
          </div>
        </div>
      )}

      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:block">
        <div className="h-full bg-sidebar border-r border-sidebar-border">
          <SidebarContent navigation={navigation} user={user} logout={logout} onAddDrone={handleAddDrone} />
        </div>
      </div>

      <div className="lg:pl-64">
        <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <img src="/images/pyro-logo.png" alt="PYRO" className="h-14 w-auto" />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-sm">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-600 font-medium">System Online</span>
              </div>
              <NotificationBell />
              <div className="flex items-center space-x-2">
                <div className="text-sm text-foreground font-medium">{user?.username}</div>
                <div className="text-xs text-muted-foreground capitalize px-2 py-1 bg-secondary rounded-md">
                  {user?.role}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}

function SidebarContent({
  navigation,
  user,
  logout,
  onAddDrone,
}: {
  navigation: any[]
  user: any
  logout: () => void
  onAddDrone: () => void // Added add drone handler prop
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-center p-6 border-b border-sidebar-border">
        <img src="/images/pyro-logo.png" alt="PYRO" className="h-16 w-auto" />
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {navigation.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
              item.current
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                : "text-sidebar-foreground hover:text-sidebar-primary-foreground hover:bg-sidebar-accent",
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </a>
        ))}

        <div className="pt-4 border-t border-sidebar-border">
          <Button
            onClick={onAddDrone}
            variant="outline"
            size="sm"
            className="w-full justify-start text-sidebar-foreground hover:text-sidebar-primary-foreground hover:bg-sidebar-accent border-sidebar-border bg-transparent"
          >
            <Plus className="h-4 w-4 mr-3" />
            Add New Drone
          </Button>
        </div>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center space-x-3 mb-4 p-3 rounded-lg bg-sidebar-accent">
          <div className="p-2 bg-sidebar-primary rounded-full">
            <Shield className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">{user?.username}</p>
            <p className="text-xs text-sidebar-foreground/70 capitalize">{user?.role} • Authorized</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="w-full justify-start text-sidebar-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
