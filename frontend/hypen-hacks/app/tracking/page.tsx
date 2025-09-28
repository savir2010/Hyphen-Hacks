"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { RealTimeTracking } from "@/components/real-time-tracking"

export default function TrackingPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <RealTimeTracking />
      </DashboardLayout>
    </AuthGuard>
  )
}
