"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Play, Square, Download, Settings, Maximize } from "lucide-react"

export function FeedControls() {
  const [isRecordingAll, setIsRecordingAll] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  return (
    <div className="flex items-center space-x-2">
      {/* Recording Controls */}
      <div className="flex items-center space-x-1">
        <Button
          size="sm"
          variant={isRecordingAll ? "destructive" : "outline"}
          onClick={() => setIsRecordingAll(!isRecordingAll)}
        >
          {isRecordingAll ? <Square className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
          {isRecordingAll ? "Stop All" : "Record All"}
        </Button>

        {isRecordingAll && (
          <Badge variant="destructive" className="animate-pulse">
            Recording
          </Badge>
        )}
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Quick Actions */}
      <Button size="sm" variant="outline">
        <Download className="h-4 w-4 mr-1" />
        Export
      </Button>

      <Button size="sm" variant="outline">
        <Maximize className="h-4 w-4 mr-1" />
        Theater Mode
      </Button>

      <Button size="sm" variant="outline" onClick={() => setShowAdvanced(!showAdvanced)}>
        <Settings className="h-4 w-4" />
      </Button>

      {/* Advanced Controls Dropdown */}
      {showAdvanced && (
        <Card className="absolute top-full right-0 mt-2 w-64 z-10 border-border/50 bg-card/95 backdrop-blur">
          <CardContent className="p-3 space-y-3">
            <div>
              <h4 className="text-sm font-medium mb-2">Stream Quality</h4>
              <div className="flex space-x-1">
                <Button size="sm" variant="outline">
                  4K
                </Button>
                <Button size="sm" variant="default">
                  HD
                </Button>
                <Button size="sm" variant="outline">
                  SD
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium mb-2">Recording Settings</h4>
              <div className="space-y-2 text-sm">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded border-border" />
                  <span>Auto-record on mission start</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-border" />
                  <span>Include audio</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded border-border" />
                  <span>Overlay telemetry data</span>
                </label>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium mb-2">Display Options</h4>
              <div className="space-y-2 text-sm">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded border-border" />
                  <span>Show signal strength</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded border-border" />
                  <span>Show battery status</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-border" />
                  <span>Show GPS coordinates</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
