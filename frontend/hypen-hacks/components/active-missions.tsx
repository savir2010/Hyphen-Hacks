"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, MapPin, Eye } from "lucide-react"

interface Mission {
  id: string
  title: string
  status: "active" | "pending" | "completed"
  priority: "high" | "medium" | "low"
  location: string
  assignedDrones: number
  personnel: number
  startTime: string
}

export function ActiveMissions() {
  const missions: Mission[] = [
    {
      id: "M-001",
      title: "Structure Fire - Downtown",
      status: "active",
      priority: "high",
      location: "425 Main St",
      assignedDrones: 3,
      personnel: 4,
      startTime: "14:23",
    },
    {
      id: "M-002",
      title: "Search & Rescue - Forest Area",
      status: "active",
      priority: "high",
      location: "Pine Ridge Trail",
      assignedDrones: 2,
      personnel: 3,
      startTime: "13:45",
    },
    {
      id: "M-003",
      title: "Traffic Incident - Highway 101",
      status: "pending",
      priority: "medium",
      location: "Mile Marker 23",
      assignedDrones: 1,
      personnel: 2,
      startTime: "15:10",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Card className="minimal-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5" />
          <span>Active Missions</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {missions.map((mission) => (
          <div key={mission.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold">{mission.title}</h3>
                  <Badge variant="outline" className={getStatusColor(mission.status)}>
                    {mission.status}
                  </Badge>
                  <Badge variant="outline" className={getPriorityColor(mission.priority)}>
                    {mission.priority}
                  </Badge>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{mission.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{mission.startTime}</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
