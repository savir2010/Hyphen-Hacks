"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, AlertTriangle, Radio } from "lucide-react"

export function QuickActions() {
  return (
    <Card className="minimal-card">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button className="w-full justify-start minimal-button">
          <Plus className="h-4 w-4 mr-2" />
          Deploy Drone
        </Button>

        <Button className="w-full justify-start bg-transparent" variant="outline">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Emergency Mission
        </Button>

        <Button className="w-full justify-start bg-transparent" variant="outline">
          <Radio className="h-4 w-4 mr-2" />
          Broadcast Alert
        </Button>
      </CardContent>
    </Card>
  )
}
