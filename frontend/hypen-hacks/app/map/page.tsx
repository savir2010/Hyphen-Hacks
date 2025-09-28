"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { LeafletMap } from "@/components/leaflet-map"

export default function MapPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="h-[calc(100vh-4rem)] relative">
          <div className="h-full minimal-card rounded-lg overflow-hidden relative">
            <LeafletMap />
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
