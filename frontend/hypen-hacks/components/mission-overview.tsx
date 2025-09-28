"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bone as Drone, Users, AlertTriangle, CheckCircle } from "lucide-react"

export function MissionOverview() {
  const [personnelCount, setPersonnelCount] = useState(0)

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    setPersonnelCount(users.length)
  }, [])

  const stats = [
    {
      title: "Active Missions",
      value: "1", // One active mission for one drone
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      title: "Deployed Drones",
      value: "1", // Only one drone deployed
      icon: Drone,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Personnel",
      value: personnelCount.toString(), // Actual registered users count
      icon: Users,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "System Status",
      value: "Online",
      icon: CheckCircle,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="emergency-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
