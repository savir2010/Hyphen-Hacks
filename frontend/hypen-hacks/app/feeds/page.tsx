"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ScoutImagesGrid } from "@/components/scout-images-grid"

export default function FeedsPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Scout Mission Images</h1>
              <p className="text-muted-foreground">Images captured during enhanced scout missions</p>
            </div>
          </div>

          <div className="emergency-card p-6">
            <ScoutImagesGrid />
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}

