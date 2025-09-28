"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { MissionOverview } from "@/components/mission-overview"
import { TelemetryDashboard } from "@/components/telemetry-dashboard"

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <MissionOverview />
          <TelemetryDashboard />
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
