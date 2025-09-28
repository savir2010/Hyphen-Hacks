"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bone as Drone, Users, Eye } from "lucide-react"

export function FeedSelector() {
  const [activeTab, setActiveTab] = useState("drones")

  const drones = [
    { id: "eagle-1", name: "Eagle-1", status: "live", mission: "M-001", viewers: 3 },
    { id: "hawk-2", name: "Hawk-2", status: "live", mission: "M-001", viewers: 2 },
    { id: "falcon-3", name: "Falcon-3", status: "live", mission: "M-002", viewers: 4 },
    { id: "raven-4", name: "Raven-4", status: "offline", mission: null, viewers: 0 },
    { id: "osprey-5", name: "Osprey-5", status: "standby", mission: null, viewers: 0 },
  ]

  const groundCameras = [
    { id: "cam-1", name: "Command Post", status: "live", location: "Base Station", viewers: 2 },
    { id: "cam-2", name: "Staging Area", status: "live", location: "Main St", viewers: 1 },
    { id: "cam-3", name: "Perimeter Cam", status: "offline", location: "North Gate", viewers: 0 },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-chart-2 text-chart-2-foreground"
      case "offline":
        return "bg-muted text-muted-foreground"
      case "standby":
        return "bg-chart-3 text-chart-3-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="drones" className="flex items-center space-x-1">
              <Drone className="h-4 w-4" />
              <span>Drones</span>
            </TabsTrigger>
            <TabsTrigger value="cameras" className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>Ground Cameras</span>
            </TabsTrigger>
            <TabsTrigger value="personnel" className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>Body Cams</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="drones" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {drones.map((drone) => (
                <div
                  key={drone.id}
                  className="p-3 border border-border/50 rounded-lg hover:bg-accent/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{drone.name}</h4>
                    <Badge variant="outline" className={getStatusColor(drone.status)}>
                      {drone.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {drone.mission && <p>Mission: {drone.mission}</p>}
                    <div className="flex items-center justify-between">
                      <span>Viewers: {drone.viewers}</span>
                      <Button size="sm" variant="outline" disabled={drone.status === "offline"}>
                        View Feed
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="cameras" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {groundCameras.map((camera) => (
                <div
                  key={camera.id}
                  className="p-3 border border-border/50 rounded-lg hover:bg-accent/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{camera.name}</h4>
                    <Badge variant="outline" className={getStatusColor(camera.status)}>
                      {camera.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Location: {camera.location}</p>
                    <div className="flex items-center justify-between">
                      <span>Viewers: {camera.viewers}</span>
                      <Button size="sm" variant="outline" disabled={camera.status === "offline"}>
                        View Feed
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="personnel" className="mt-4">
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Body camera feeds will appear here when personnel are equipped with recording devices.</p>
              <Button variant="outline" className="mt-4 bg-transparent">
                Configure Body Cameras
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
