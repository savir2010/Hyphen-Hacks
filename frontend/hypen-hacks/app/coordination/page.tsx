"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { EmergencyCoordination } from "@/components/emergency-coordination"

export default function CoordinationPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <EmergencyCoordination />
      </DashboardLayout>
    </AuthGuard>
  )
}
