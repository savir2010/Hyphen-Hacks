"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bone as Drone,
  Battery,
  Navigation,
  Radio,
  Play,
  Pause,
  Square,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Zap,
  Wind,
  Gauge,
} from "lucide-react"

interface DroneControlData {
  id: string
  name: string
  status: "active" | "standby" | "maintenance" | "emergency"
  battery: number
  altitude: number
  speed: number
  temperature: number
  signal: number
  coordinates: { lat: number; lng: number }
  mission?: string
}

export function DroneControlPanel() {
  const [selectedDrone, setSelectedDrone] = useState<string>("D-001")
  const [isFlying, setIsFlying] = useState(false)
  const [altitude, setAltitude] = useState([100])
  const [speed, setSpeed] = useState([25])

  const drones: DroneControlData[] = [
    {
      id: "D-001",
      name: "Eagle-1",
      status: "active",
      battery: 87,
      altitude: 150,
      speed: 32,
      temperature: 18,
      signal: 95,
      coordinates: { lat: 40.7128, lng: -74.006 },
      mission: "M-001",
    },
    {
      id: "D-002",
      name: "Hawk-2",
      status: "active",
      battery: 72,
      altitude: 200,
      speed: 28,
      temperature: 16,
      signal: 88,
      coordinates: { lat: 40.7589, lng: -73.9851 },
      mission: "M-001",
    },
    {
      id: "D-003",
      name: "Falcon-3",
      status: "standby",
      battery: 100,
      altitude: 0,
      speed: 0,
      temperature: 22,
      signal: 100,
      coordinates: { lat: 40.7505, lng: -73.9934 },
    },
  ]

  const currentDrone = drones.find((d) => d.id === selectedDrone) || drones[0]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "operational"
      case "standby":
        return "bg-secondary text-secondary-foreground"
      case "maintenance":
        return "warning"
      case "emergency":
        return "critical-alert"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  const handleFlightControl = (action: string) => {
    console.log(`[v0] Flight control action: ${action} for drone ${selectedDrone}`)
    // Simulate flight control actions
  }

  return (
    <div className="space-y-6">
      {/* Drone Selection */}
      <Card className="emergency-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Drone className="h-5 w-5 text-primary" />
            <span>Drone Control Center</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedDrone} onValueChange={setSelectedDrone}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select drone to control" />
            </SelectTrigger>
            <SelectContent>
              {drones.map((drone) => (
                <SelectItem key={drone.id} value={drone.id}>
                  <div className="flex items-center space-x-2">
                    <span>{drone.name}</span>
                    <Badge className={`status-indicator ${getStatusColor(drone.status)}`}>{drone.status}</Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Telemetry Data */}
        <Card className="emergency-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Gauge className="h-5 w-5 text-accent" />
              <span>Live Telemetry - {currentDrone.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Battery className="h-4 w-4 text-chart-3" />
                  <span className="text-sm text-muted-foreground">Battery</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{currentDrone.battery}%</div>
                <Progress value={currentDrone.battery} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Navigation className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Altitude</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{currentDrone.altitude}m</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Wind className="h-4 w-4 text-chart-2" />
                  <span className="text-sm text-muted-foreground">Speed</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{currentDrone.speed} km/h</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Radio className="h-4 w-4 text-chart-4" />
                  <span className="text-sm text-muted-foreground">Signal</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{currentDrone.signal}%</div>
                <Progress value={currentDrone.signal} className="h-2" />
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Temperature:</span>
                  <span className="ml-2 font-medium">{currentDrone.temperature}°C</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Mission:</span>
                  <span className="ml-2 font-medium">{currentDrone.mission || "None"}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Coordinates:</span>
                  <span className="ml-2 font-mono text-xs">
                    {currentDrone.coordinates.lat.toFixed(4)}, {currentDrone.coordinates.lng.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flight Controls */}
        <Card className="emergency-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Navigation className="h-5 w-5 text-primary" />
              <span>Flight Controls</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual">Manual Control</TabsTrigger>
                <TabsTrigger value="auto">Auto Pilot</TabsTrigger>
              </TabsList>

              <TabsContent value="manual" className="space-y-4">
                {/* Flight Status */}
                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <span className="text-sm font-medium">Flight Status:</span>
                  <Badge
                    className={`status-indicator ${isFlying ? "operational" : "bg-secondary text-secondary-foreground"}`}
                  >
                    {isFlying ? "In Flight" : "Grounded"}
                  </Badge>
                </div>

                {/* Primary Controls */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFlightControl("takeoff")}
                    disabled={isFlying}
                    className="flex items-center space-x-1"
                  >
                    <Play className="h-4 w-4" />
                    <span>Takeoff</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFlightControl("hover")}
                    disabled={!isFlying}
                    className="flex items-center space-x-1"
                  >
                    <Pause className="h-4 w-4" />
                    <span>Hover</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFlightControl("land")}
                    disabled={!isFlying}
                    className="flex items-center space-x-1"
                  >
                    <Square className="h-4 w-4" />
                    <span>Land</span>
                  </Button>
                </div>

                {/* Directional Controls */}
                <div className="space-y-3">
                  <div className="text-sm font-medium text-muted-foreground">Directional Control</div>
                  <div className="grid grid-cols-3 gap-2 max-w-32 mx-auto">
                    <div></div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFlightControl("forward")}
                      disabled={!isFlying}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <div></div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFlightControl("left")}
                      disabled={!isFlying}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFlightControl("stop")}
                      disabled={!isFlying}
                    >
                      <Square className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFlightControl("right")}
                      disabled={!isFlying}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <div></div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFlightControl("backward")}
                      disabled={!isFlying}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <div></div>
                  </div>
                </div>

                {/* Altitude & Speed Controls */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Target Altitude: {altitude[0]}m</label>
                    <Slider
                      value={altitude}
                      onValueChange={setAltitude}
                      max={500}
                      min={10}
                      step={10}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Target Speed: {speed[0]} km/h</label>
                    <Slider value={speed} onValueChange={setSpeed} max={80} min={5} step={5} className="mt-2" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="auto" className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <Navigation className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Auto Pilot controls will be available in the next update.</p>
                  <p className="text-sm mt-2">Switch to Manual Control for direct drone operation.</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Controls */}
      <Card className="emergency-card border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-destructive">
            <Zap className="h-5 w-5" />
            <span>Emergency Controls</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="destructive"
              onClick={() => handleFlightControl("emergency_land")}
              className="flex items-center space-x-2"
            >
              <Square className="h-4 w-4" />
              <span>Emergency Land</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleFlightControl("return_home")}
              className="flex items-center space-x-2 border-chart-4 text-chart-4 hover:bg-chart-4/10"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Return to Base</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleFlightControl("cut_power")}
              className="flex items-center space-x-2 border-destructive text-destructive hover:bg-destructive/10"
            >
              <Zap className="h-4 w-4" />
              <span>Cut Power</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
