"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CommunicationsCenter } from "@/components/communications-center"

export default function CommunicationsPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <CommunicationsCenter />
      </DashboardLayout>
    </AuthGuard>
  )
}
