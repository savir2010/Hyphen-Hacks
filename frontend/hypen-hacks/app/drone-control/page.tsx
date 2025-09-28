"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DroneControlPanel } from "@/components/drone-control-panel"

export default function DroneControlPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Drone Control</h1>
              <p className="text-muted-foreground">Direct control and monitoring of emergency response drones</p>
            </div>
          </div>

          <DroneControlPanel />
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
