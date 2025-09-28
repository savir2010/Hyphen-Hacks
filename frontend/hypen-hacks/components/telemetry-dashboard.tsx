"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Battery,
  Signal,
  Thermometer,
  Wind,
  Compass,
  Gauge,
  MapPin,
  Clock,
  Activity,
  AlertTriangle,
} from "lucide-react"

interface TelemetryData {
  droneId: string
  droneName: string
  status: "active" | "idle" | "offline" | "returning" | "maintenance"
  battery: number
  signal: number
  altitude: number
  speed: number
  temperature: number
  windSpeed: number
  heading: number
  gps: { lat: number; lng: number }
  flightTime: number
  lastUpdate: Date
  vibration: number
  fuelLevel?: number
  engineTemp?: number
  rotorRPM?: number
  missionProgress?: number
}

export function TelemetryDashboard() {
  const [telemetryData, setTelemetryData] = useState<TelemetryData[]>([
    {
      droneId: "eagle-1",
      droneName: "Eagle-1",
      status: "active",
      battery: 87,
      signal: 95,
      altitude: 150,
      speed: 25,
      temperature: 22,
      windSpeed: 8,
      heading: 245,
      gps: { lat: 40.7128, lng: -74.006 },
      flightTime: 1847,
      lastUpdate: new Date(),
      vibration: 2.3,
      rotorRPM: 1850,
      missionProgress: 65,
    },
  ])

  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("connected")
  const [alertCount, setAlertCount] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetryData((prev) =>
        prev.map((drone) => {
          let batteryChange = -0.5
          let altitudeChange = 0
          let speedChange = 0

          if (drone.status === "active") {
            batteryChange = -0.8
            altitudeChange = (Math.random() - 0.5) * 15
            speedChange = (Math.random() - 0.5) * 8
          } else if (drone.status === "returning") {
            batteryChange = -1.2
            altitudeChange = -2
            speedChange = (Math.random() - 0.3) * 5
          } else if (drone.status === "idle") {
            batteryChange = -0.1
            altitudeChange = 0
            speedChange = 0
          }

          const newBattery = Math.max(0, drone.battery + batteryChange + (Math.random() - 0.5) * 1)
          const newAltitude = Math.max(0, drone.altitude + altitudeChange)
          const newSpeed = Math.max(0, drone.speed + speedChange)

          let newMissionProgress = drone.missionProgress || 0
          if (drone.status === "active" && newMissionProgress < 100) {
            newMissionProgress = Math.min(100, newMissionProgress + Math.random() * 2)
          }

          return {
            ...drone,
            battery: newBattery,
            signal: Math.max(0, Math.min(100, drone.signal + (Math.random() - 0.5) * 5)),
            altitude: newAltitude,
            speed: newSpeed,
            temperature: drone.temperature + (Math.random() - 0.5) * 2,
            windSpeed: Math.max(0, drone.windSpeed + (Math.random() - 0.5) * 3),
            heading: (drone.heading + (Math.random() - 0.5) * 10) % 360,
            flightTime: drone.status === "active" ? drone.flightTime + 1 : drone.flightTime,
            vibration: Math.max(0, drone.vibration + (Math.random() - 0.5) * 0.5),
            rotorRPM: drone.rotorRPM ? Math.max(0, drone.rotorRPM + (Math.random() - 0.5) * 100) : undefined,
            missionProgress: newMissionProgress,
            lastUpdate: new Date(),
            gps: {
              lat: drone.gps.lat + (Math.random() - 0.5) * 0.0001,
              lng: drone.gps.lng + (Math.random() - 0.5) * 0.0001,
            },
          }
        }),
      )

      setAlertCount((prev) => {
        const currentAlerts = telemetryData.filter(
          (drone) =>
            drone.battery < 20 ||
            drone.signal < 70 ||
            drone.temperature > 50 ||
            (drone.vibration && drone.vibration > 3),
        ).length
        return currentAlerts
      })

      console.log("[v0] Single drone telemetry data updated")
    }, 2000)

    return () => clearInterval(interval)
  }, [telemetryData])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "idle":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "offline":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "returning":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "maintenance":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Real-time Telemetry</h3>
        <div className="flex items-center space-x-4">
          {alertCount > 0 && (
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <Badge variant="destructive" className="text-xs">
                {alertCount} Alert{alertCount !== 1 ? "s" : ""}
              </Badge>
            </div>
          )}

          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <div
              className={`w-2 h-2 rounded-full ${
                connectionStatus === "connected"
                  ? "bg-green-500 animate-pulse"
                  : connectionStatus === "connecting"
                    ? "bg-yellow-500 animate-pulse"
                    : "bg-red-500"
              }`}
            />
            <span>Live Data</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {telemetryData.map((drone) => (
          <Card key={drone.droneId} className="minimal-card w-full max-w-4xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{drone.droneName}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className={getStatusColor(drone.status)}>
                    {drone.status}
                  </Badge>
                  {drone.missionProgress !== undefined && (
                    <Badge variant="outline" className="text-xs">
                      {Math.round(drone.missionProgress)}%
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-1 text-xs text-gray-600">
                    <Battery className={`h-3 w-3 ${drone.battery < 20 ? "text-destructive" : "text-chart-2"}`} />
                    <span>Battery</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={drone.battery} className="flex-1 h-2" />
                    <span className={`text-xs font-medium ${drone.battery < 20 ? "text-destructive" : ""}`}>
                      {Math.round(drone.battery)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-1 text-xs text-gray-600">
                    <Signal className={`h-3 w-3 ${drone.signal < 70 ? "text-destructive" : "text-chart-1"}`} />
                    <span>Signal</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={drone.signal} className="flex-1 h-2" />
                    <span className={`text-xs font-medium ${drone.signal < 70 ? "text-destructive" : ""}`}>
                      {Math.round(drone.signal)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-1 text-xs text-gray-600">
                    <Gauge className="h-4 w-4 text-gray-500" />
                    <span>Altitude</span>
                  </div>
                  <p className="font-medium text-sm">{Math.round(drone.altitude)}ft</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-1 text-xs text-gray-600">
                    <Wind className="h-4 w-4 text-gray-500" />
                    <span>Speed</span>
                  </div>
                  <p className="font-medium text-sm">{Math.round(drone.speed)}mph</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Thermometer className={`h-4 w-4 ${drone.temperature > 50 ? "text-destructive" : "text-gray-500"}`} />
                  <div>
                    <p className="text-xs text-gray-600">Temp</p>
                    <p className={`font-medium ${drone.temperature > 50 ? "text-destructive" : ""}`}>
                      {Math.round(drone.temperature)}°C
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Compass className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-600">Heading</p>
                    <p className="font-medium">{Math.round(drone.heading)}°</p>
                  </div>
                </div>
                {drone.vibration && (
                  <div className="flex items-center space-x-2">
                    <Activity className={`h-4 w-4 ${drone.vibration > 3 ? "text-destructive" : "text-gray-500"}`} />
                    <div>
                      <p className="text-xs text-gray-600">Vibration</p>
                      <p className={`font-medium ${drone.vibration > 3 ? "text-destructive" : ""}`}>
                        {drone.vibration.toFixed(1)}g
                      </p>
                    </div>
                  </div>
                )}
                {drone.rotorRPM && (
                  <div className="flex items-center space-x-2">
                    <Gauge className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-600">Rotor RPM</p>
                      <p className="font-medium">{Math.round(drone.rotorRPM)}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-600">GPS Position</p>
                    <p className="font-mono text-xs">
                      {drone.gps.lat.toFixed(4)}, {drone.gps.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-600">Flight Time</p>
                    <p className="font-mono text-xs">{formatTime(drone.flightTime)}</p>
                  </div>
                </div>
              </div>

              {drone.missionProgress !== undefined && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Mission Progress</span>
                      <span className="font-medium">{Math.round(drone.missionProgress)}%</span>
                    </div>
                    <Progress value={drone.missionProgress} className="h-2" />
                  </div>
                </>
              )}

              <div className="text-xs text-gray-400 text-center pt-2 border-t border-gray-100">
                Last update: {drone.lastUpdate.toLocaleTimeString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
