"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Bone as Drone, Battery, Signal, Thermometer, Gauge } from "lucide-react"

interface DroneMetric {
  id: string
  name: string
  status: "active" | "standby" | "maintenance"
  battery: number
  signal: number
  temperature: number
  speed: number
  altitude: number
  flightTime: number
}

export function DroneMetrics() {
  const [metrics, setMetrics] = useState<DroneMetric[]>([
    {
      id: "eagle-1",
      name: "Eagle-1",
      status: "active",
      battery: 87,
      signal: 95,
      temperature: 42,
      speed: 25,
      altitude: 150,
      flightTime: 45,
    },
    {
      id: "hawk-2",
      name: "Hawk-2",
      status: "active",
      battery: 72,
      signal: 88,
      temperature: 38,
      speed: 30,
      altitude: 200,
      flightTime: 32,
    },
    {
      id: "falcon-3",
      name: "Falcon-3",
      status: "active",
      battery: 91,
      signal: 92,
      temperature: 40,
      speed: 22,
      altitude: 180,
      flightTime: 28,
    },
  ])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) =>
        prev.map((drone) => ({
          ...drone,
          battery: Math.max(0, drone.battery + (Math.random() - 0.6) * 2),
          signal: Math.max(0, Math.min(100, drone.signal + (Math.random() - 0.5) * 5)),
          temperature: Math.max(20, Math.min(60, drone.temperature + (Math.random() - 0.5) * 3)),
          speed: Math.max(0, Math.min(50, drone.speed + (Math.random() - 0.5) * 5)),
          altitude: Math.max(0, Math.min(300, drone.altitude + (Math.random() - 0.5) * 10)),
          flightTime: drone.flightTime + 1,
        })),
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-chart-2 text-chart-2-foreground"
      case "standby":
        return "bg-chart-3 text-chart-3-foreground"
      case "maintenance":
        return "bg-chart-4 text-chart-4-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getBatteryColor = (battery: number) => {
    if (battery > 50) return "text-chart-2"
    if (battery > 20) return "text-chart-3"
    return "text-chart-4"
  }

  const getTemperatureColor = (temp: number) => {
    if (temp > 50) return "text-chart-4"
    if (temp > 40) return "text-chart-3"
    return "text-chart-2"
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Drone className="h-5 w-5 text-chart-1" />
          <span>Live Drone Metrics</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((drone) => (
          <div key={drone.id} className="p-4 border border-border/30 rounded-lg space-y-4">
            {/* Drone Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold">{drone.name}</h4>
                <Badge variant="outline" className={getStatusColor(drone.status)}>
                  {drone.status}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Flight: {Math.floor(drone.flightTime / 60)}h {drone.flightTime % 60}m
              </div>
            </div>

            {/* Primary Metrics */}
            <div className="grid grid-cols-2 gap-4">
              {/* Battery */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <Battery className={`h-3 w-3 ${getBatteryColor(drone.battery)}`} />
                    <span>Battery</span>
                  </div>
                  <span className={getBatteryColor(drone.battery)}>{drone.battery.toFixed(0)}%</span>
                </div>
                <Progress value={drone.battery} className="h-2" />
              </div>

              {/* Signal */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <Signal className="h-3 w-3 text-chart-1" />
                    <span>Signal</span>
                  </div>
                  <span className="text-chart-1">{drone.signal.toFixed(0)}%</span>
                </div>
                <Progress value={drone.signal} className="h-2" />
              </div>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Thermometer className={`h-3 w-3 ${getTemperatureColor(drone.temperature)}`} />
                  <span>Temp</span>
                </div>
                <span className={getTemperatureColor(drone.temperature)}>{drone.temperature.toFixed(0)}°C</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Gauge className="h-3 w-3 text-muted-foreground" />
                  <span>Speed</span>
                </div>
                <span>{drone.speed.toFixed(0)} mph</span>
              </div>
            </div>

            {/* Altitude */}
            <div className="text-sm">
              <div className="flex items-center justify-between mb-1">
                <span>Altitude</span>
                <span>{drone.altitude.toFixed(0)} ft</span>
              </div>
              <Progress value={(drone.altitude / 300) * 100} className="h-1" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
