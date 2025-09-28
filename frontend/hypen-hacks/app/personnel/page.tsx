"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PersonnelManagement } from "@/components/personnel-management"

export default function PersonnelPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <PersonnelManagement />
      </DashboardLayout>
    </AuthGuard>
  )
}
