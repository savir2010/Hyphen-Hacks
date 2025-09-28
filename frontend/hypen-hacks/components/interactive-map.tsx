"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bone as Drone, MapPin, AlertTriangle, Flame, Users, Eye, Navigation } from "lucide-react"

interface MapMarker {
  id: string
  type: "drone" | "hazard" | "mission" | "personnel"
  position: { x: number; y: number }
  data: any
}

export function InteractiveMap() {
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null)
  const [mapView, setMapView] = useState<"satellite" | "terrain">("satellite")

  const [markers, setMarkers] = useState<MapMarker[]>([
    {
      id: "drone-1",
      type: "drone",
      position: { x: 35, y: 40 },
      data: {
        name: "Eagle-1",
        status: "active",
        battery: 87,
        altitude: 150,
        mission: "M-001",
      },
    },
    {
      id: "hazard-1",
      type: "hazard",
      position: { x: 40, y: 38 },
      data: {
        type: "fire",
        severity: "high",
        description: "Structure fire - Downtown",
        address: "425 Main St",
      },
    },
    {
      id: "personnel-1",
      type: "personnel",
      position: { x: 38, y: 42 },
      data: {
        unit: "Engine 12",
        personnel: 4,
        status: "on-scene",
      },
    },
  ])

  // Simulate drone movement
  useEffect(() => {
    const interval = setInterval(() => {
      setMarkers((prev) =>
        prev.map((marker) => {
          if (marker.type === "drone" && marker.data.status === "active") {
            return {
              ...marker,
              position: {
                x: marker.position.x + (Math.random() - 0.5) * 2,
                y: marker.position.y + (Math.random() - 0.5) * 2,
              },
            }
          }
          return marker
        }),
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getMarkerIcon = (marker: MapMarker) => {
    switch (marker.type) {
      case "drone":
        return <Drone className="h-4 w-4" />
      case "hazard":
        return marker.data.type === "fire" ? <Flame className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />
      case "personnel":
        return <Users className="h-4 w-4" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  const getMarkerColor = (marker: MapMarker) => {
    switch (marker.type) {
      case "drone":
        return marker.data.status === "active" ? "bg-chart-1 text-white" : "bg-chart-3 text-white"
      case "hazard":
        return marker.data.severity === "high" ? "bg-chart-4 text-white" : "bg-chart-3 text-white"
      case "personnel":
        return "bg-chart-2 text-white"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="relative w-full h-full">
      {/* Map Background */}
      <div
        className={`w-full h-full ${
          mapView === "satellite"
            ? "bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900"
            : "bg-gradient-to-br from-green-900 via-green-800 to-green-700"
        } relative overflow-hidden`}
      >
        {/* Grid overlay for reference */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full grid grid-cols-10 grid-rows-10 border-l border-t border-white/20">
            {Array.from({ length: 100 }).map((_, i) => (
              <div key={i} className="border-r border-b border-white/20" />
            ))}
          </div>
        </div>

        {/* Simulated terrain features */}
        <div className="absolute top-1/4 left-1/3 w-32 h-24 bg-green-600/30 rounded-full blur-sm" />
        <div className="absolute bottom-1/3 right-1/4 w-40 h-20 bg-blue-600/30 rounded-full blur-sm" />
        <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-gray-600/40 rounded-full blur-sm" />

        {/* Map Markers */}
        {markers.map((marker) => (
          <div
            key={marker.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-110"
            style={{
              left: `${marker.position.x}%`,
              top: `${marker.position.y}%`,
            }}
            onClick={() => setSelectedMarker(marker)}
          >
            <div className={`p-2 rounded-full shadow-lg ${getMarkerColor(marker)} animate-pulse`}>
              {getMarkerIcon(marker)}
            </div>

            {/* Drone flight path indicator */}
            {marker.type === "drone" && marker.data.status === "active" && (
              <div className="absolute inset-0 rounded-full border-2 border-chart-1/50 animate-ping" />
            )}
          </div>
        ))}

        <div className="absolute top-[30%] left-[30%] w-[20%] h-[15%] border-2 border-chart-4/60 rounded-lg bg-chart-4/10">
          <div className="absolute -top-6 left-2 text-xs text-chart-4 font-medium">Active Mission M-001</div>
        </div>
      </div>

      {/* Marker Details Popup */}
      {selectedMarker && (
        <div className="absolute top-4 right-4 w-80 z-20">
          <Card className="border-border/50 bg-card/95 backdrop-blur">
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center space-x-2">
                  {getMarkerIcon(selectedMarker)}
                  <span>
                    {selectedMarker.type === "drone" && selectedMarker.data.name}
                    {selectedMarker.type === "hazard" && selectedMarker.data.description}
                    {selectedMarker.type === "personnel" && selectedMarker.data.unit}
                  </span>
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedMarker(null)}>
                  ×
                </Button>
              </div>

              {selectedMarker.type === "drone" && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Status:</span>
                    <Badge variant="outline" className="bg-chart-2 text-chart-2-foreground">
                      {selectedMarker.data.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Battery:</span>
                    <span className="text-chart-2">{selectedMarker.data.battery}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Altitude:</span>
                    <span>{selectedMarker.data.altitude}ft</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Mission:</span>
                    <span className="text-chart-1">{selectedMarker.data.mission}</span>
                  </div>
                </div>
              )}

              {selectedMarker.type === "hazard" && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Type:</span>
                    <Badge variant="outline" className="bg-chart-4 text-chart-4-foreground">
                      {selectedMarker.data.type.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Severity:</span>
                    <span className="text-chart-4">{selectedMarker.data.severity}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Location:</span>
                    <p className="text-pretty">{selectedMarker.data.address}</p>
                  </div>
                </div>
              )}

              {selectedMarker.type === "personnel" && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Personnel:</span>
                    <span>{selectedMarker.data.personnel} members</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Status:</span>
                    <Badge variant="outline" className="bg-chart-2 text-chart-2-foreground">
                      {selectedMarker.data.status}
                    </Badge>
                  </div>
                </div>
              )}

              <div className="flex space-x-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  <Eye className="h-3 w-3 mr-1" />
                  Details
                </Button>
                {selectedMarker.type === "drone" && (
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    <Navigation className="h-3 w-3 mr-1" />
                    Control
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
