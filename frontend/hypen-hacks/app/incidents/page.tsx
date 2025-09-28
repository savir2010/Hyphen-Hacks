"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { IncidentManagement } from "@/components/incident-management"

export default function IncidentsPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <IncidentManagement />
      </DashboardLayout>
    </AuthGuard>
  )
}
