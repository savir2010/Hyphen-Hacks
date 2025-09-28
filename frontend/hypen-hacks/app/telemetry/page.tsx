"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { TelemetryOverview } from "@/components/telemetry-overview"
import { TelemetryCharts } from "@/components/telemetry-charts"
import { TelemetryReports } from "@/components/telemetry-reports"
import { EmergencyAnalysis } from "@/components/emergency-analysis"

export default function TelemetryPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Telemetry Overview */}
          <TelemetryOverview />

          <div className="space-y-6">
            {/* Emergency Analysis Section */}
            <div className="w-full">
              <EmergencyAnalysis />
            </div>

            {/* Reports Section - Distributed evenly at bottom */}
            <div className="w-full">
              <TelemetryReports />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
