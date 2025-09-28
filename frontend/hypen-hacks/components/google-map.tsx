"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Bone as Drone, MapPin, AlertTriangle, Flame, Users, Eye, Navigation, Battery, Radio } from "lucide-react"

interface MapMarker {
  id: string
  type: "drone" | "hazard" | "mission" | "personnel" | "incident"
  position: { lat: number; lng: number }
  data: any
  lastUpdate?: string
}

interface DronePosition {
  id: string
  lat: number
  lng: number
  heading: number
  altitude: number
  speed: number
  battery: number
  signal: number
  status: string
}

export function GoogleMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [trackingMode, setTrackingMode] = useState<"all" | "drones" | "incidents" | "personnel">("all")
  const [dronePositions, setDronePositions] = useState<DronePosition[]>([])

  const [markers, setMarkers] = useState<MapMarker[]>([
    {
      id: "drone-1",
      type: "drone",
      position: { lat: 37.7749, lng: -122.4194 },
      lastUpdate: new Date().toLocaleTimeString(),
      data: {
        name: "Eagle-1",
        status: "active",
        battery: 87,
        altitude: 150,
        speed: 32,
        mission: "INC-001",
        flightTime: "00:22:15",
        signal: 95,
      },
    },
    {
      id: "drone-2",
      type: "drone",
      position: { lat: 37.7849, lng: -122.4094 },
      lastUpdate: new Date().toLocaleTimeString(),
      data: {
        name: "Hawk-2",
        status: "active",
        battery: 72,
        altitude: 200,
        speed: 28,
        mission: "INC-001",
        flightTime: "00:18:30",
        signal: 88,
      },
    },
    {
      id: "drone-3",
      type: "drone",
      position: { lat: 37.7649, lng: -122.4394 },
      lastUpdate: new Date().toLocaleTimeString(),
      data: {
        name: "Falcon-3",
        status: "returning",
        battery: 45,
        altitude: 100,
        speed: 35,
        mission: "INC-002",
        flightTime: "00:35:20",
        signal: 92,
      },
    },
    {
      id: "incident-1",
      type: "incident",
      position: { lat: 37.7649, lng: -122.4294 },
      lastUpdate: new Date().toLocaleTimeString(),
      data: {
        id: "INC-001",
        type: "fire",
        severity: "critical",
        title: "Structure Fire - Downtown",
        address: "425 Main St",
        status: "active",
        assignedDrones: 2,
        assignedPersonnel: 4,
        progress: 35,
      },
    },
    {
      id: "incident-2",
      type: "incident",
      position: { lat: 37.7589, lng: -122.3851 },
      lastUpdate: new Date().toLocaleTimeString(),
      data: {
        id: "INC-002",
        type: "search_rescue",
        severity: "high",
        title: "Missing Hiker",
        address: "Pine Ridge Trail",
        status: "active",
        assignedDrones: 1,
        assignedPersonnel: 3,
        progress: 60,
      },
    },
    {
      id: "personnel-1",
      type: "personnel",
      position: { lat: 37.7549, lng: -122.4394 },
      lastUpdate: new Date().toLocaleTimeString(),
      data: {
        unit: "Engine 12",
        personnel: 4,
        status: "on-scene",
        commander: "Capt. Rodriguez",
        incident: "INC-001",
      },
    },
    {
      id: "personnel-2",
      type: "personnel",
      position: { lat: 37.7589, lng: -122.3851 },
      lastUpdate: new Date().toLocaleTimeString(),
      data: {
        unit: "SAR Team Alpha",
        personnel: 3,
        status: "searching",
        commander: "Lt. Park",
        incident: "INC-002",
      },
    },
  ])

  const initializeSecureMap = useCallback(() => {
    if (!mapRef.current) return

    // Create a professional emergency response map using CSS and HTML
    const mapContainer = mapRef.current
    mapContainer.innerHTML = `
      <div class="w-full h-full bg-slate-800 rounded-lg relative overflow-hidden border border-border/50">
        <div class="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900"></div>
        
        <!-- Grid overlay for professional look -->
        <div class="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" viewBox="0 0 400 300">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
              </pattern>
              <pattern id="majorGrid" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <rect width="100%" height="100%" fill="url(#majorGrid)" />
          </svg>
        </div>
        
        <!-- Drone markers with enhanced styling -->
        <div class="absolute top-1/3 left-1/4 cursor-pointer group" data-marker="drone-1">
          <div class="w-5 h-5 bg-blue-500 rounded-full animate-pulse shadow-lg border-2 border-white/50 group-hover:scale-110 transition-transform">
            <div class="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75"></div>
          </div>
          <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-blue-200 font-medium whitespace-nowrap bg-black/50 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            Eagle-1 (Active)
          </div>
        </div>
        
        <div class="absolute top-1/2 right-1/3 cursor-pointer group" data-marker="drone-2">
          <div class="w-5 h-5 bg-green-500 rounded-full animate-pulse shadow-lg border-2 border-white/50 group-hover:scale-110 transition-transform">
            <div class="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
          </div>
          <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-green-200 font-medium whitespace-nowrap bg-black/50 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            Hawk-2 (Active)
          </div>
        </div>
        
        <div class="absolute bottom-1/3 left-1/2 cursor-pointer group" data-marker="drone-3">
          <div class="w-5 h-5 bg-yellow-500 rounded-full animate-pulse shadow-lg border-2 border-white/50 group-hover:scale-110 transition-transform">
            <div class="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
          </div>
          <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-yellow-200 font-medium whitespace-nowrap bg-black/50 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            Falcon-3 (Returning)
          </div>
        </div>
        
        <!-- Incident markers -->
        <div class="absolute top-1/2 left-1/3 cursor-pointer group" data-marker="incident-1">
          <div class="w-4 h-4 bg-red-500 rounded-full shadow-lg border-2 border-white/50 group-hover:scale-110 transition-transform">
            <div class="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75"></div>
          </div>
          <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-red-200 font-medium whitespace-nowrap bg-black/50 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            Structure Fire (Critical)
          </div>
        </div>
        
        <div class="absolute bottom-1/4 right-1/4 cursor-pointer group" data-marker="incident-2">
          <div class="w-4 h-4 bg-orange-500 rounded-full shadow-lg border-2 border-white/50 group-hover:scale-110 transition-transform">
            <div class="absolute inset-0 bg-orange-400 rounded-full animate-ping opacity-75"></div>
          </div>
          <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-orange-200 font-medium whitespace-nowrap bg-black/50 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            Search & Rescue (High)
          </div>
        </div>
        
        <!-- Personnel markers -->
        <div class="absolute top-2/3 left-1/3 cursor-pointer group" data-marker="personnel-1">
          <div class="w-3 h-3 bg-green-400 rounded-full shadow-lg border border-white/50 group-hover:scale-110 transition-transform"></div>
          <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-green-200 font-medium whitespace-nowrap bg-black/50 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            Engine 12
          </div>
        </div>
        
        <div class="absolute bottom-1/4 right-1/3 cursor-pointer group" data-marker="personnel-2">
          <div class="w-3 h-3 bg-green-400 rounded-full shadow-lg border border-white/50 group-hover:scale-110 transition-transform"></div>
          <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-green-200 font-medium whitespace-nowrap bg-black/50 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            SAR Team Alpha
          </div>
        </div>
        
        <!-- Flight paths for active drones -->
        <svg class="absolute inset-0 pointer-events-none" width="100%" height="100%">
          <defs>
            <linearGradient id="flightPath1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.6" />
              <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:0.1" />
            </linearGradient>
            <linearGradient id="flightPath2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#10b981;stop-opacity:0.6" />
              <stop offset="100%" style="stop-color:#10b981;stop-opacity:0.1" />
            </linearGradient>
          </defs>
          <path d="M 25% 33% Q 40% 20% 60% 35%" stroke="url(#flightPath1)" strokeWidth="2" fill="none" strokeDasharray="5,5">
            <animate attributeName="stroke-dashoffset" values="0;10" dur="2s" repeatCount="indefinite"/>
          </path>
          <path d="M 67% 50% Q 80% 35% 90% 55%" stroke="url(#flightPath2)" strokeWidth="2" fill="none" strokeDasharray="5,5">
            <animate attributeName="stroke-dashoffset" values="0;10" dur="2s" repeatCount="indefinite"/>
          </path>
        </svg>
        
        <!-- Center coordinates display -->
        <div class="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-3 py-2 rounded-lg border border-white/20">
          <div class="font-mono">San Francisco Bay Area</div>
          <div class="text-xs opacity-75">37.7749°N, 122.4194°W</div>
        </div>
        
        <!-- Secure map indicator -->
        <div class="absolute top-4 right-4 bg-green-500/20 border border-green-500/50 text-green-200 text-xs px-3 py-2 rounded-lg">
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span class="font-medium">Secure Map Mode</span>
          </div>
          <div class="text-xs mt-1 opacity-75">Real-time tracking active</div>
        </div>
        
        <!-- Legend -->
        <div class="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-3 py-2 rounded-lg border border-white/20">
          <div class="space-y-1">
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Active Drones</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Critical Incidents</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>Personnel</span>
            </div>
          </div>
        </div>
      </div>
    `

    // Add click event listeners to markers
    const markerElements = mapContainer.querySelectorAll("[data-marker]")
    markerElements.forEach((element) => {
      element.addEventListener("click", (e) => {
        const markerId = (e.currentTarget as HTMLElement).getAttribute("data-marker")
        const marker = markers.find((m) => m.id === markerId)
        if (marker) {
          setSelectedMarker(marker)
        }
      })
    })

    setIsLoaded(true)
    console.log("[v0] Secure emergency response map initialized")
  }, [markers])

  useEffect(() => {
    const interval = setInterval(() => {
      setMarkers((prevMarkers) =>
        prevMarkers.map((marker) => {
          if (marker.type === "drone") {
            // Simulate drone movement
            const newLat = marker.position.lat + (Math.random() - 0.5) * 0.001
            const newLng = marker.position.lng + (Math.random() - 0.5) * 0.001

            return {
              ...marker,
              position: { lat: newLat, lng: newLng },
              lastUpdate: new Date().toLocaleTimeString(),
              data: {
                ...marker.data,
                battery: Math.max(0, marker.data.battery + (Math.random() - 0.6) * 2),
                signal: Math.max(0, Math.min(100, marker.data.signal + (Math.random() - 0.5) * 5)),
                altitude: Math.max(0, marker.data.altitude + (Math.random() - 0.5) * 10),
                speed: Math.max(0, marker.data.speed + (Math.random() - 0.5) * 5),
              },
            }
          }
          return marker
        }),
      )

      console.log("[v0] Real-time drone positions updated")
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const shouldShowMarker = (marker: MapMarker) => {
    if (trackingMode === "all") return true
    if (trackingMode === "drones") return marker.type === "drone"
    if (trackingMode === "incidents") return marker.type === "incident"
    if (trackingMode === "personnel") return marker.type === "personnel"
    return true
  }

  const getMarkerIcon = (marker: MapMarker) => {
    switch (marker.type) {
      case "drone":
        return <Drone className="h-4 w-4" />
      case "incident":
        return marker.data.type === "fire" ? <Flame className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />
      case "personnel":
        return <Users className="h-4 w-4" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  useEffect(() => {
    initializeSecureMap()
  }, [initializeSecureMap])

  useEffect(() => {
    if (isLoaded) {
      initializeSecureMap()
    }
  }, [markers, initializeSecureMap, isLoaded])

  return (
    <div className="relative w-full h-full">
      {/* Tracking Mode Controls */}
      <div className="absolute top-4 left-4 z-20">
        <Card className="emergency-card p-2">
          <div className="flex space-x-1">
            {["all", "drones", "incidents", "personnel"].map((mode) => (
              <Button
                key={mode}
                variant={trackingMode === mode ? "default" : "outline"}
                size="sm"
                onClick={() => setTrackingMode(mode as any)}
                className="text-xs capitalize status-text"
              >
                {mode}
              </Button>
            ))}
          </div>
        </Card>
      </div>

      <div className="absolute top-4 right-4 z-20">
        <Card className="emergency-card p-2">
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="telemetry-label">Live Tracking</span>
            <Badge variant="outline" className="text-xs status-text">
              {markers.filter((m) => m.type === "drone").length} Drones
            </Badge>
          </div>
        </Card>
      </div>

      {/* Secure Map Container */}
      <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden" />

      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-background/90 flex items-center justify-center rounded-lg">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground font-medium emergency-heading">Loading Emergency Response Map...</p>
          </div>
        </div>
      )}

      {/* Enhanced Marker Details Popup */}
      {selectedMarker && (
        <div className="absolute top-4 right-4 w-96 z-20">
          <Card className="emergency-card">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="emergency-heading font-semibold flex items-center space-x-2 text-foreground">
                  {getMarkerIcon(selectedMarker)}
                  <span>
                    {selectedMarker.type === "drone" && selectedMarker.data.name}
                    {selectedMarker.type === "incident" && selectedMarker.data.title}
                    {selectedMarker.type === "personnel" && selectedMarker.data.unit}
                  </span>
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMarker(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ×
                </Button>
              </div>

              {/* Drone Details */}
              {selectedMarker.type === "drone" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="space-y-1">
                      <span className="telemetry-label">Status:</span>
                      <Badge
                        className={`status-indicator ${
                          selectedMarker.data.status === "active"
                            ? "operational"
                            : selectedMarker.data.status === "returning"
                              ? "warning"
                              : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {selectedMarker.data.status}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <span className="telemetry-label">Mission:</span>
                      <span className="data-display font-medium text-foreground">{selectedMarker.data.mission}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1">
                        <Battery className="h-3 w-3 text-chart-3" />
                        <span className="telemetry-label">Battery</span>
                      </div>
                      <span className="telemetry-value">{selectedMarker.data.battery}%</span>
                    </div>
                    <Progress value={selectedMarker.data.battery} className="h-2" />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 bg-secondary/50 rounded">
                      <div className="telemetry-label">Altitude</div>
                      <div className="telemetry-value text-sm">{selectedMarker.data.altitude}m</div>
                    </div>
                    <div className="text-center p-2 bg-secondary/50 rounded">
                      <div className="telemetry-label">Speed</div>
                      <div className="telemetry-value text-sm">{selectedMarker.data.speed} km/h</div>
                    </div>
                    <div className="text-center p-2 bg-secondary/50 rounded">
                      <div className="telemetry-label">Signal</div>
                      <div className="telemetry-value text-sm">{selectedMarker.data.signal}%</div>
                    </div>
                  </div>

                  <div className="text-xs telemetry-label">
                    Flight Time: {selectedMarker.data.flightTime} | Last Update: {selectedMarker.lastUpdate}
                  </div>
                </div>
              )}

              {/* Incident Details */}
              {selectedMarker.type === "incident" && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Badge
                      className={`status-indicator ${
                        selectedMarker.data.severity === "critical"
                          ? "critical-alert"
                          : selectedMarker.data.severity === "high"
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : "warning"
                      }`}
                    >
                      {selectedMarker.data.severity}
                    </Badge>
                    <Badge className="status-indicator operational">{selectedMarker.data.status}</Badge>
                  </div>

                  <div className="text-sm space-y-2">
                    <div>
                      <span className="telemetry-label">Location: </span>
                      <span className="text-foreground">{selectedMarker.data.address}</span>
                    </div>
                    <div>
                      <span className="telemetry-label">ID: </span>
                      <span className="data-display text-xs">{selectedMarker.data.id}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center p-2 bg-secondary/50 rounded">
                      <div className="telemetry-label">Drones</div>
                      <div className="telemetry-value text-sm">{selectedMarker.data.assignedDrones}</div>
                    </div>
                    <div className="text-center p-2 bg-secondary/50 rounded">
                      <div className="telemetry-label">Personnel</div>
                      <div className="telemetry-value text-sm">{selectedMarker.data.assignedPersonnel}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="telemetry-label">Progress</span>
                      <span className="telemetry-value">{selectedMarker.data.progress}%</span>
                    </div>
                    <Progress value={selectedMarker.data.progress} className="h-2" />
                  </div>
                </div>
              )}

              {/* Personnel Details */}
              {selectedMarker.type === "personnel" && (
                <div className="space-y-3">
                  <div className="text-sm space-y-2">
                    <div>
                      <span className="telemetry-label">Commander: </span>
                      <span className="text-foreground">{selectedMarker.data.commander}</span>
                    </div>
                    <div>
                      <span className="telemetry-label">Personnel: </span>
                      <span className="text-foreground">{selectedMarker.data.personnel}</span>
                    </div>
                    <div>
                      <span className="telemetry-label">Incident: </span>
                      <span className="data-display text-xs">{selectedMarker.data.incident}</span>
                    </div>
                  </div>
                  <Badge className="status-indicator operational">{selectedMarker.data.status}</Badge>
                </div>
              )}

              <div className="flex space-x-2 pt-2">
                <Button size="sm" className="flex-1 status-text">
                  <Eye className="h-3 w-3 mr-1" />
                  Details
                </Button>
                {selectedMarker.type === "drone" && (
                  <Button size="sm" className="flex-1 status-text">
                    <Navigation className="h-3 w-3 mr-1" />
                    Control
                  </Button>
                )}
                {selectedMarker.type === "personnel" && (
                  <Button size="sm" className="flex-1 status-text">
                    <Radio className="h-3 w-3 mr-1" />
                    Contact
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
