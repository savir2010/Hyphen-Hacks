"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Bone as Drone, Battery } from "lucide-react"

interface DroneData {
  id: string
  name: string
  status: "active" | "standby" | "maintenance"
  battery: number
  mission?: string
}

export function DroneStatus() {
  const drones: DroneData[] = [
    {
      id: "D-001",
      name: "Eagle-1",
      status: "active",
      battery: 87,
      mission: "M-001",
    },
    {
      id: "D-002",
      name: "Hawk-2",
      status: "active",
      battery: 72,
      mission: "M-001",
    },
    {
      id: "D-003",
      name: "Falcon-3",
      status: "active",
      battery: 91,
      mission: "M-002",
    },
    {
      id: "D-004",
      name: "Raven-4",
      status: "standby",
      battery: 100,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "standby":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "maintenance":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getBatteryColor = (battery: number) => {
    if (battery > 50) return "text-green-600"
    if (battery > 20) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Card className="minimal-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Drone className="h-5 w-5" />
          <span>Drone Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {drones.map((drone) => (
          <div key={drone.id} className="p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium">{drone.name}</span>
                <Badge variant="outline" className={getStatusColor(drone.status)}>
                  {drone.status}
                </Badge>
              </div>
              {drone.mission && <span className="text-xs text-gray-500">{drone.mission}</span>}
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-1">
                <Battery className={`h-3 w-3 ${getBatteryColor(drone.battery)}`} />
                <span>Battery</span>
              </div>
              <span className={getBatteryColor(drone.battery)}>{drone.battery}%</span>
            </div>
            <Progress value={drone.battery} className="h-1 mt-1" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
