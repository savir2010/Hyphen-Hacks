"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Bone as Drone, Eye, Navigation, Battery, Crosshair, Satellite, Mountain } from "lucide-react"

interface MapMarker {
  id: string
  type: "drone" | "hazard" | "mission" | "personnel" | "incident"
  position: { lat: number; lng: number }
  data: any
  lastUpdate?: string
}

export function LeafletMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>(null)
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [mapType, setMapType] = useState<"satellite" | "terrain">("satellite")
  const [markers, setMarkers] = useState<MapMarker[]>([])

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser")
      return
    }

    console.log("[v0] Requesting user location...")
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        console.log(`[v0] User location obtained: ${latitude}, ${longitude}`)
        setUserLocation({ lat: latitude, lng: longitude })
        setLocationError(null)

        const userDrone: MapMarker = {
          id: "user-drone",
          type: "drone",
          position: { lat: latitude, lng: longitude },
          lastUpdate: new Date().toLocaleTimeString(),
          data: {
            name: "Command-1 (Your Location)",
            status: "active",
            battery: 95,
            altitude: 120,
            speed: 0,
            mission: "STANDBY",
            flightTime: "00:00:00",
            signal: 100,
            isUserDrone: true,
          },
        }

        setMarkers([userDrone])
      },
      (error) => {
        console.error("[v0] Geolocation error:", error)
        let errorMessage = "Unable to get your location"
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable."
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out."
            break
        }
        setLocationError(errorMessage)

        const fallbackLocation = { lat: 37.7749, lng: -122.4194 }
        setUserLocation(fallbackLocation)
        const fallbackMarkers: MapMarker[] = [
          {
            id: "user-drone",
            type: "drone",
            position: fallbackLocation,
            lastUpdate: new Date().toLocaleTimeString(),
            data: {
              name: "Command-1 (Fallback Location)",
              status: "active",
              battery: 95,
              altitude: 120,
              speed: 0,
              mission: "STANDBY",
              flightTime: "00:00:00",
              signal: 100,
              isUserDrone: true,
            },
          },
        ]
        setMarkers(fallbackMarkers)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    )
  }, [])

  const initializeLeafletMap = useCallback(async () => {
    if (!mapRef.current || mapInstanceRef.current || !userLocation) return

    try {
      console.log("[v0] Initializing Leaflet map...")
      const L = (await import("leaflet")).default

      if (typeof window !== "undefined") {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)
      }

      const map = L.map(mapRef.current).setView([userLocation.lat, userLocation.lng], 15)

      const satelliteLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "© Esri, Maxar, Earthstar Geographics",
          maxZoom: 19,
        },
      )

      const terrainLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "© Esri, HERE, Garmin, Intermap, increment P Corp., GEBCO, USGS, FAO, NPS, NRCAN, GeoBase, IGN, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), © OpenStreetMap contributors",
          maxZoom: 19,
        },
      )

      // Add initial layer based on mapType
      if (mapType === "satellite") {
        satelliteLayer.addTo(map)
      } else {
        terrainLayer.addTo(map)
      }

      // Store layers for switching
      map.satelliteLayer = satelliteLayer
      map.terrainLayer = terrainLayer

      // Custom marker icon for user drone
      const createUserDroneIcon = () => {
        return L.divIcon({
          className: "custom-marker",
          html: `
            <div style="
              width: 40px;
              height: 40px;
              background-color: #10b981;
              border: 4px solid white;
              border-radius: 50%;
              box-shadow: 0 4px 12px rgba(0,0,0,0.4);
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                color: white;
                font-size: 18px;
                font-weight: bold;
              ">
                🚁
              </div>
              <div style="
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background-color: #10b981;
                opacity: 0.3;
                animation: pulse 2s infinite;
              "></div>
            </div>
            <style>
              @keyframes pulse {
                0% { transform: scale(1); opacity: 0.3; }
                50% { transform: scale(1.3); opacity: 0.1; }
                100% { transform: scale(1); opacity: 0.3; }
              }
            </style>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        })
      }

      // Clear existing markers
      if (markersRef.current) {
        markersRef.current.forEach((marker) => map.removeLayer(marker))
      }
      markersRef.current = []

      // Add user drone marker
      markers.forEach((markerData) => {
        if (markerData.data.isUserDrone) {
          const icon = createUserDroneIcon()
          const marker = L.marker([markerData.position.lat, markerData.position.lng], { icon })
            .addTo(map)
            .on("click", () => {
              setSelectedMarker(markerData)
            })

          const popupContent = `
            <div class="p-3 text-center">
              <h3 class="font-semibold text-sm mb-2">
                ${markerData.data.name}
              </h3>
              <p class="text-xs text-gray-600">
                Status: ${markerData.data.status}
              </p>
              <p class="text-xs text-gray-500 mt-1">
                Your current location
              </p>
            </div>
          `
          marker.bindPopup(popupContent)
          markersRef.current.push(marker)
        }
      })

      mapInstanceRef.current = map
      setIsLoaded(true)
      console.log("[v0] Leaflet map with satellite/terrain imagery initialized successfully")
    } catch (error) {
      console.error("[v0] Error initializing Leaflet map:", error)
    }
  }, [markers, userLocation, mapType])

  // Handle map type switching
  const switchMapType = useCallback(
    (newType: "satellite" | "terrain") => {
      if (mapInstanceRef.current && newType !== mapType) {
        const map = mapInstanceRef.current

        // Remove current layer
        if (mapType === "satellite" && map.satelliteLayer) {
          map.removeLayer(map.satelliteLayer)
        } else if (mapType === "terrain" && map.terrainLayer) {
          map.removeLayer(map.terrainLayer)
        }

        // Add new layer
        if (newType === "satellite" && map.satelliteLayer) {
          map.addLayer(map.satelliteLayer)
        } else if (newType === "terrain" && map.terrainLayer) {
          map.addLayer(map.terrainLayer)
        }

        setMapType(newType)
      }
    },
    [mapType],
  )

  useEffect(() => {
    getCurrentLocation()
  }, [getCurrentLocation])

  useEffect(() => {
    if (userLocation) {
      initializeLeafletMap()
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [initializeLeafletMap, userLocation])

  const centerOnUser = () => {
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 15)
    }
  }

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 left-4 z-[1000]">
        <Card className="emergency-card p-2">
          <div className="flex space-x-1">
            <Button
              variant={mapType === "satellite" ? "default" : "outline"}
              size="sm"
              onClick={() => switchMapType("satellite")}
              className="text-xs flex items-center space-x-1"
            >
              <Satellite className="h-3 w-3" />
              <span>Satellite</span>
            </Button>
            <Button
              variant={mapType === "terrain" ? "default" : "outline"}
              size="sm"
              onClick={() => switchMapType("terrain")}
              className="text-xs flex items-center space-x-1"
            >
              <Mountain className="h-3 w-3" />
              <span>Terrain</span>
            </Button>
          </div>
        </Card>
      </div>

      <div className="absolute top-4 right-4 z-[1000] space-y-2">
        <Card className="emergency-card p-2">
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="telemetry-label">Live Tracking</span>
            <Badge variant="outline" className="text-xs status-text">
              1 Drone
            </Badge>
          </div>
        </Card>

        {userLocation && (
          <Card className="emergency-card p-2">
            <Button
              size="sm"
              variant="outline"
              onClick={centerOnUser}
              className="text-xs flex items-center space-x-1 bg-transparent"
            >
              <Crosshair className="h-3 w-3" />
              <span>Center on You</span>
            </Button>
          </Card>
        )}

        {locationError && (
          <Card className="emergency-card p-2 bg-destructive/10 border-destructive/20">
            <p className="text-xs text-destructive">{locationError}</p>
          </Card>
        )}
      </div>

      {/* Leaflet Map Container */}
      <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden" />

      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-background/90 flex items-center justify-center rounded-lg z-[1000]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground font-medium emergency-heading">
              {userLocation ? `Loading ${mapType} imagery...` : "Getting your location..."}
            </p>
          </div>
        </div>
      )}

      {/* Enhanced Marker Details Popup */}
      {selectedMarker && (
        <div className="absolute top-4 right-4 w-96 z-[1000]">
          <Card className="emergency-card">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="emergency-heading font-semibold flex items-center space-x-2 text-foreground">
                  <Drone className="h-4 w-4" />
                  <span>{selectedMarker.data.name}</span>
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

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <span className="telemetry-label">Status:</span>
                    <Badge className="status-indicator operational">{selectedMarker.data.status}</Badge>
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

              <div className="flex space-x-2 pt-2">
                <Button size="sm" className="flex-1 status-text">
                  <Eye className="h-3 w-3 mr-1" />
                  Details
                </Button>
                <Button size="sm" className="flex-1 status-text">
                  <Navigation className="h-3 w-3 mr-1" />
                  Control
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
