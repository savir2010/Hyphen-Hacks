"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bone as Drone, Users, AlertTriangle, Navigation, Battery, Radio, Clock, MapPin, Activity } from "lucide-react"

interface TrackingData {
  drones: Array<{
    id: string
    name: string
    status: "active" | "standby" | "returning" | "maintenance"
    battery: number
    altitude: number
    speed: number
    signal: number
    mission?: string
    lastUpdate: string
  }>
  personnel: Array<{
    id: string
    unit: string
    status: "on-scene" | "en-route" | "available" | "off-duty"
    location: string
    personnel: number
    lastUpdate: string
  }>
  incidents: Array<{
    id: string
    title: string
    status: "active" | "pending" | "resolved"
    priority: "critical" | "high" | "medium" | "low"
    progress: number
    assignedAssets: number
    lastUpdate: string
  }>
}

export function RealTimeTracking() {
  const [trackingData, setTrackingData] = useState<TrackingData>({
    drones: [
      {
        id: "D-001",
        name: "Eagle-1",
        status: "active",
        battery: 87,
        altitude: 150,
        speed: 32,
        signal: 95,
        mission: "INC-001",
        lastUpdate: "14:45:23",
      },
      {
        id: "D-002",
        name: "Hawk-2",
        status: "active",
        battery: 72,
        altitude: 200,
        speed: 28,
        signal: 88,
        mission: "INC-001",
        lastUpdate: "14:45:18",
      },
      {
        id: "D-003",
        name: "Falcon-3",
        status: "returning",
        battery: 45,
        altitude: 100,
        speed: 35,
        signal: 92,
        mission: "INC-002",
        lastUpdate: "14:45:15",
      },
    ],
    personnel: [
      {
        id: "P-001",
        unit: "Engine 12",
        status: "on-scene",
        location: "425 Main St",
        personnel: 4,
        lastUpdate: "14:44:30",
      },
      {
        id: "P-002",
        unit: "SAR Team Alpha",
        status: "on-scene",
        location: "Pine Ridge Trail",
        personnel: 3,
        lastUpdate: "14:43:45",
      },
    ],
    incidents: [
      {
        id: "INC-001",
        title: "Structure Fire - Downtown",
        status: "active",
        priority: "critical",
        progress: 35,
        assignedAssets: 6,
        lastUpdate: "14:45:00",
      },
      {
        id: "INC-002",
        title: "Missing Hiker - Pine Ridge",
        status: "active",
        priority: "high",
        progress: 60,
        assignedAssets: 4,
        lastUpdate: "14:42:30",
      },
    ],
  })

  const [lastUpdateTime, setLastUpdateTime] = useState(new Date())

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setLastUpdateTime(new Date())
      // In a real app, this would fetch from WebSocket or API
      console.log("[v0] Real-time tracking data updated")
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string, type: "drone" | "personnel" | "incident") => {
    if (type === "drone") {
      switch (status) {
        case "active":
          return "operational"
        case "returning":
          return "warning"
        case "standby":
          return "bg-secondary text-secondary-foreground"
        case "maintenance":
          return "bg-destructive/10 text-destructive border-destructive/20"
        default:
          return "bg-secondary text-secondary-foreground"
      }
    }
    if (type === "personnel") {
      switch (status) {
        case "on-scene":
          return "operational"
        case "en-route":
          return "warning"
        case "available":
          return "bg-chart-3/10 text-chart-3 border-chart-3/20"
        case "off-duty":
          return "bg-muted text-muted-foreground"
        default:
          return "bg-secondary text-secondary-foreground"
      }
    }
    if (type === "incident") {
      switch (status) {
        case "active":
          return "operational"
        case "pending":
          return "warning"
        case "resolved":
          return "bg-chart-3/10 text-chart-3 border-chart-3/20"
        default:
          return "bg-secondary text-secondary-foreground"
      }
    }
    return "bg-secondary text-secondary-foreground"
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "critical-alert"
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "medium":
        return "warning"
      case "low":
        return "bg-secondary text-secondary-foreground"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Real-time Tracking</h2>
          <p className="text-muted-foreground">Live monitoring of all emergency response assets</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4 text-chart-3" />
          <span>Last update: {lastUpdateTime.toLocaleTimeString()}</span>
        </div>
      </div>

      <Tabs defaultValue="drones" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="drones">Drones ({trackingData.drones.length})</TabsTrigger>
          <TabsTrigger value="personnel">Personnel ({trackingData.personnel.length})</TabsTrigger>
          <TabsTrigger value="incidents">Incidents ({trackingData.incidents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="drones" className="space-y-4">
          <div className="grid gap-4">
            {trackingData.drones.map((drone) => (
              <Card key={drone.id} className="emergency-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Drone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{drone.name}</h3>
                        <p className="text-sm text-muted-foreground">ID: {drone.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={`status-indicator ${getStatusColor(drone.status, "drone")}`}>
                        {drone.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Navigation className="h-3 w-3 mr-1" />
                        Track
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Battery className="h-3 w-3" />
                        <span>Battery</span>
                      </div>
                      <div className="text-lg font-semibold">{drone.battery}%</div>
                      <Progress value={drone.battery} className="h-1" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Altitude</div>
                      <div className="text-lg font-semibold">{drone.altitude}m</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Speed</div>
                      <div className="text-lg font-semibold">{drone.speed} km/h</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Radio className="h-3 w-3" />
                        <span>Signal</span>
                      </div>
                      <div className="text-lg font-semibold">{drone.signal}%</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      {drone.mission && (
                        <div className="flex items-center space-x-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Mission: {drone.mission}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>Updated: {drone.lastUpdate}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="personnel" className="space-y-4">
          <div className="grid gap-4">
            {trackingData.personnel.map((unit) => (
              <Card key={unit.id} className="emergency-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-chart-3/10 rounded-lg">
                        <Users className="h-5 w-5 text-chart-3" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{unit.unit}</h3>
                        <p className="text-sm text-muted-foreground">{unit.personnel} personnel</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={`status-indicator ${getStatusColor(unit.status, "personnel")}`}>
                        {unit.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Radio className="h-3 w-3 mr-1" />
                        Contact
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{unit.location}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Updated: {unit.lastUpdate}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <div className="grid gap-4">
            {trackingData.incidents.map((incident) => (
              <Card key={incident.id} className="emergency-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-destructive/10 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{incident.title}</h3>
                        <p className="text-sm text-muted-foreground">ID: {incident.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={`status-indicator ${getPriorityColor(incident.priority)}`}>
                        {incident.priority}
                      </Badge>
                      <Badge className={`status-indicator ${getStatusColor(incident.status, "incident")}`}>
                        {incident.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{incident.progress}%</span>
                    </div>
                    <Progress value={incident.progress} className="h-2" />

                    <div className="flex items-center justify-between text-sm">
                      <div className="text-muted-foreground">
                        Assigned Assets: <span className="font-medium text-foreground">{incident.assignedAssets}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Updated: {incident.lastUpdate}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
