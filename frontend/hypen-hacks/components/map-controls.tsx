"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ZoomIn, ZoomOut, RotateCcw, Satellite, Mountain, Layers, Target, Navigation } from "lucide-react"

export function MapControls() {
  const [mapView, setMapView] = useState<"satellite" | "terrain" | "hybrid">("hybrid")
  const [showLayers, setShowLayers] = useState(true)

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Zoom and Navigation Controls */}
      <Card className="emergency-card p-3">
        <div className="text-xs text-muted-foreground mb-2">Navigation</div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="bg-transparent">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="bg-transparent">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="bg-transparent">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="bg-transparent">
            <Target className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Map Type Controls */}
      <Card className="emergency-card p-3">
        <div className="text-xs text-muted-foreground mb-2">Map Type</div>
        <div className="space-y-1">
          <Button
            variant={mapView === "satellite" ? "default" : "outline"}
            size="sm"
            onClick={() => setMapView("satellite")}
            className="w-full text-xs"
          >
            <Satellite className="h-3 w-3 mr-1" />
            Satellite
          </Button>
          <Button
            variant={mapView === "terrain" ? "default" : "outline"}
            size="sm"
            onClick={() => setMapView("terrain")}
            className="w-full text-xs"
          >
            <Mountain className="h-3 w-3 mr-1" />
            Terrain
          </Button>
          <Button
            variant={mapView === "hybrid" ? "default" : "outline"}
            size="sm"
            onClick={() => setMapView("hybrid")}
            className="w-full text-xs"
          >
            <Layers className="h-3 w-3 mr-1" />
            Hybrid
          </Button>
        </div>
      </Card>

      {/* Layer Controls */}
      <Card className="emergency-card p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-muted-foreground">Layers</div>
          <Button variant="ghost" size="sm" onClick={() => setShowLayers(!showLayers)} className="h-6 w-6 p-0">
            <Layers className="h-3 w-3" />
          </Button>
        </div>
        {showLayers && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span>Drones</span>
              <Badge variant="outline" className="operational text-xs px-1">
                7
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>Incidents</span>
              <Badge variant="outline" className="critical-alert text-xs px-1">
                2
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>Personnel</span>
              <Badge variant="outline" className="bg-chart-3/10 text-chart-3 border-chart-3/20 text-xs px-1">
                12
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>Flight Paths</span>
              <div className="h-2 w-2 bg-primary rounded-full" />
            </div>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card className="emergency-card p-3">
        <div className="text-xs text-muted-foreground mb-2">Quick Actions</div>
        <div className="space-y-1">
          <Button variant="outline" size="sm" className="w-full text-xs bg-transparent">
            <Navigation className="h-3 w-3 mr-1" />
            Center All
          </Button>
          <Button variant="outline" size="sm" className="w-full text-xs bg-transparent">
            <Target className="h-3 w-3 mr-1" />
            Track Active
          </Button>
        </div>
      </Card>
    </div>
  )
}
