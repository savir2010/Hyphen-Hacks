"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Command,
  Users,
  Bone as Drone,
  AlertTriangle,
  Clock,
  MapPin,
  Radio,
  Zap,
  CheckCircle,
  XCircle,
  Plus,
  Send,
  Target,
  Shield,
} from "lucide-react"

interface Mission {
  id: string
  title: string
  status: "planning" | "active" | "completed" | "cancelled"
  priority: "critical" | "high" | "medium" | "low"
  type: "fire" | "medical" | "search_rescue" | "traffic" | "natural_disaster"
  commander: string
  assignedDrones: string[]
  assignedPersonnel: string[]
  objectives: Array<{
    id: string
    description: string
    status: "pending" | "in-progress" | "completed"
    assignedTo?: string
  }>
  timeline: Array<{
    id: string
    timestamp: string
    event: string
    type: "info" | "warning" | "success" | "error"
  }>
  location: string
  estimatedDuration: number
  progress: number
}

interface Resource {
  id: string
  name: string
  type: "drone" | "personnel" | "vehicle" | "equipment"
  status: "available" | "deployed" | "maintenance" | "offline"
  location: string
  capabilities: string[]
  currentMission?: string
}

export function EmergencyCoordination() {
  const [selectedMission, setSelectedMission] = useState<string>("M-001")
  const [isCreateMissionOpen, setIsCreateMissionOpen] = useState(false)
  const [isResourceAllocationOpen, setIsResourceAllocationOpen] = useState(false)

  const missions: Mission[] = [
    {
      id: "M-001",
      title: "Structure Fire - Downtown Commercial Building",
      status: "active",
      priority: "critical",
      type: "fire",
      commander: "Sarah Chen",
      assignedDrones: ["D-001", "D-002", "D-003"],
      assignedPersonnel: ["Engine-12", "Ladder-7", "Rescue-3", "Command-1"],
      location: "425 Main St, Downtown",
      estimatedDuration: 180,
      progress: 35,
      objectives: [
        {
          id: "obj-1",
          description: "Establish perimeter and evacuate adjacent buildings",
          status: "completed",
          assignedTo: "Engine-12",
        },
        {
          id: "obj-2",
          description: "Deploy thermal imaging drones for reconnaissance",
          status: "completed",
          assignedTo: "D-001, D-002",
        },
        {
          id: "obj-3",
          description: "Search and rescue operations on 3rd floor",
          status: "in-progress",
          assignedTo: "Rescue-3",
        },
        {
          id: "obj-4",
          description: "Fire suppression and containment",
          status: "in-progress",
          assignedTo: "Ladder-7",
        },
      ],
      timeline: [
        {
          id: "1",
          timestamp: "14:45",
          event: "Thermal imaging confirms heat signatures on 3rd floor",
          type: "warning",
        },
        {
          id: "2",
          timestamp: "14:30",
          event: "All drones deployed and operational",
          type: "success",
        },
        {
          id: "3",
          timestamp: "14:25",
          event: "Perimeter established, evacuation in progress",
          type: "info",
        },
        {
          id: "4",
          timestamp: "14:23",
          event: "Mission initiated - Structure fire reported",
          type: "info",
        },
      ],
    },
    {
      id: "M-002",
      title: "Search & Rescue - Missing Hiker",
      status: "active",
      priority: "high",
      type: "search_rescue",
      commander: "Lisa Park",
      assignedDrones: ["D-004", "D-005"],
      assignedPersonnel: ["SAR-Alpha", "SAR-Bravo", "Medical-2"],
      location: "Pine Ridge Trail, Sector 7",
      estimatedDuration: 240,
      progress: 60,
      objectives: [
        {
          id: "obj-5",
          description: "Aerial search pattern deployment",
          status: "completed",
          assignedTo: "D-004, D-005",
        },
        {
          id: "obj-6",
          description: "Ground search teams positioned",
          status: "completed",
          assignedTo: "SAR-Alpha, SAR-Bravo",
        },
        {
          id: "obj-7",
          description: "Investigate potential target location",
          status: "in-progress",
          assignedTo: "SAR-Alpha",
        },
      ],
      timeline: [
        {
          id: "5",
          timestamp: "15:20",
          event: "Potential target spotted 2km north of last known position",
          type: "info",
        },
        {
          id: "6",
          timestamp: "14:50",
          event: "Search pattern 60% complete",
          type: "info",
        },
        {
          id: "7",
          timestamp: "13:45",
          event: "SAR mission initiated",
          type: "info",
        },
      ],
    },
  ]

  const resources: Resource[] = [
    {
      id: "D-001",
      name: "Eagle-1",
      type: "drone",
      status: "deployed",
      location: "Downtown Sector",
      capabilities: ["Thermal Imaging", "4K Video", "Night Vision"],
      currentMission: "M-001",
    },
    {
      id: "D-002",
      name: "Hawk-2",
      type: "drone",
      status: "deployed",
      location: "Downtown Sector",
      capabilities: ["Thermal Imaging", "Zoom Camera", "Spotlight"],
      currentMission: "M-001",
    },
    {
      id: "D-006",
      name: "Raven-6",
      type: "drone",
      status: "available",
      location: "Base Station",
      capabilities: ["Standard Camera", "GPS Tracking"],
    },
    {
      id: "Engine-12",
      name: "Engine 12",
      type: "personnel",
      status: "deployed",
      location: "425 Main St",
      capabilities: ["Fire Suppression", "Rescue Operations"],
      currentMission: "M-001",
    },
    {
      id: "SAR-Alpha",
      name: "SAR Team Alpha",
      type: "personnel",
      status: "deployed",
      location: "Pine Ridge Trail",
      capabilities: ["Search & Rescue", "Medical Aid", "Technical Rescue"],
      currentMission: "M-002",
    },
  ]

  const currentMission = missions.find((m) => m.id === selectedMission) || missions[0]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "deployed":
        return "operational"
      case "planning":
      case "available":
        return "bg-chart-3/10 text-chart-3 border-chart-3/20"
      case "completed":
        return "bg-chart-3/10 text-chart-3 border-chart-3/20"
      case "cancelled":
      case "offline":
        return "bg-muted text-muted-foreground"
      case "maintenance":
        return "warning"
      default:
        return "bg-secondary text-secondary-foreground"
    }
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

  const getObjectiveStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-chart-3" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-chart-4" />
      case "pending":
        return <XCircle className="h-4 w-4 text-muted-foreground" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Emergency Response Coordination</h2>
          <p className="text-muted-foreground">Command center for mission planning and resource coordination</p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isResourceAllocationOpen} onOpenChange={setIsResourceAllocationOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                <Users className="h-4 w-4" />
                <span>Allocate Resources</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Resource Allocation</DialogTitle>
              </DialogHeader>
              <ResourceAllocationForm onClose={() => setIsResourceAllocationOpen(false)} resources={resources} />
            </DialogContent>
          </Dialog>
          <Dialog open={isCreateMissionOpen} onOpenChange={setIsCreateMissionOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>New Mission</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Mission</DialogTitle>
              </DialogHeader>
              <CreateMissionForm onClose={() => setIsCreateMissionOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mission Overview */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="emergency-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Command className="h-5 w-5 text-primary" />
                  <span>Active Missions</span>
                </CardTitle>
                <Select value={selectedMission} onValueChange={setSelectedMission}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {missions.map((mission) => (
                      <SelectItem key={mission.id} value={mission.id}>
                        {mission.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-foreground">{currentMission.title}</h3>
                  <div className="flex items-center space-x-2">
                    <Badge className={`status-indicator ${getPriorityColor(currentMission.priority)}`}>
                      {currentMission.priority}
                    </Badge>
                    <Badge className={`status-indicator ${getStatusColor(currentMission.status)}`}>
                      {currentMission.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">Commander: {currentMission.commander}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-foreground">{currentMission.progress}%</div>
                  <div className="text-sm text-muted-foreground">Complete</div>
                </div>
              </div>

              <Progress value={currentMission.progress} className="h-3" />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{currentMission.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Est. {currentMission.estimatedDuration} min</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Drone className="h-4 w-4 text-muted-foreground" />
                  <span>{currentMission.assignedDrones.length} drones assigned</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{currentMission.assignedPersonnel.length} units assigned</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="objectives" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="objectives">Mission Objectives</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="resources">Assigned Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="objectives">
              <Card className="emergency-card">
                <CardHeader>
                  <CardTitle>Mission Objectives</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {currentMission.objectives.map((objective) => (
                    <div key={objective.id} className="flex items-start space-x-3 p-3 bg-secondary/30 rounded-lg">
                      {getObjectiveStatusIcon(objective.status)}
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium text-foreground">{objective.description}</p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <Badge
                            className={`status-indicator ${getStatusColor(objective.status)} text-xs`}
                            variant="outline"
                          >
                            {objective.status}
                          </Badge>
                          {objective.assignedTo && <span>Assigned to: {objective.assignedTo}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline">
              <Card className="emergency-card">
                <CardHeader>
                  <CardTitle>Mission Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {currentMission.timeline.map((event) => (
                    <div key={event.id} className="flex items-start space-x-3 p-3 bg-secondary/30 rounded-lg">
                      <div className="flex-shrink-0">
                        {event.type === "success" && <CheckCircle className="h-4 w-4 text-chart-3" />}
                        {event.type === "warning" && <AlertTriangle className="h-4 w-4 text-chart-4" />}
                        {event.type === "error" && <XCircle className="h-4 w-4 text-destructive" />}
                        {event.type === "info" && <Clock className="h-4 w-4 text-primary" />}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm text-foreground">{event.event}</p>
                        <div className="text-xs text-muted-foreground">{event.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources">
              <Card className="emergency-card">
                <CardHeader>
                  <CardTitle>Assigned Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground">Drones</h4>
                    {currentMission.assignedDrones.map((droneId) => {
                      const drone = resources.find((r) => r.id === droneId)
                      return (
                        drone && (
                          <div key={droneId} className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                            <div className="flex items-center space-x-2">
                              <Drone className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium">{drone.name}</span>
                            </div>
                            <Badge className={`status-indicator ${getStatusColor(drone.status)} text-xs`}>
                              {drone.status}
                            </Badge>
                          </div>
                        )
                      )
                    })}
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground">Personnel Units</h4>
                    {currentMission.assignedPersonnel.map((unitId) => {
                      const unit = resources.find((r) => r.id === unitId)
                      return (
                        unit && (
                          <div key={unitId} className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-chart-3" />
                              <span className="text-sm font-medium">{unit.name}</span>
                            </div>
                            <Badge className={`status-indicator ${getStatusColor(unit.status)} text-xs`}>
                              {unit.status}
                            </Badge>
                          </div>
                        )
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Command Center Sidebar */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <Card className="emergency-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-chart-4" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="destructive" className="w-full justify-start" size="sm">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Emergency Alert
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                <Radio className="h-4 w-4 mr-2" />
                All Units Check-in
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                <Target className="h-4 w-4 mr-2" />
                Deploy Available Assets
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                <Shield className="h-4 w-4 mr-2" />
                Activate Backup Protocol
              </Button>
            </CardContent>
          </Card>

          {/* Resource Status */}
          <Card className="emergency-card">
            <CardHeader>
              <CardTitle>Resource Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Available Drones</span>
                  <span className="font-medium">
                    {resources.filter((r) => r.type === "drone" && r.status === "available").length}/
                    {resources.filter((r) => r.type === "drone").length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Available Personnel</span>
                  <span className="font-medium">
                    {resources.filter((r) => r.type === "personnel" && r.status === "available").length}/
                    {resources.filter((r) => r.type === "personnel").length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active Missions</span>
                  <span className="font-medium">{missions.filter((m) => m.status === "active").length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mission Statistics */}
          <Card className="emergency-card">
            <CardHeader>
              <CardTitle>Mission Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 bg-secondary/30 rounded">
                  <div className="text-lg font-bold text-foreground">2</div>
                  <div className="text-xs text-muted-foreground">Active</div>
                </div>
                <div className="p-2 bg-secondary/30 rounded">
                  <div className="text-lg font-bold text-foreground">15</div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
                <div className="p-2 bg-secondary/30 rounded">
                  <div className="text-lg font-bold text-foreground">47%</div>
                  <div className="text-xs text-muted-foreground">Avg Progress</div>
                </div>
                <div className="p-2 bg-secondary/30 rounded">
                  <div className="text-lg font-bold text-foreground">98%</div>
                  <div className="text-xs text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function CreateMissionForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    priority: "",
    location: "",
    description: "",
    commander: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Creating new mission:", formData)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Mission Type</label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fire">Fire Emergency</SelectItem>
              <SelectItem value="medical">Medical Emergency</SelectItem>
              <SelectItem value="search_rescue">Search & Rescue</SelectItem>
              <SelectItem value="traffic">Traffic Incident</SelectItem>
              <SelectItem value="natural_disaster">Natural Disaster</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Priority</label>
          <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Mission Title</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Brief mission title"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Location</label>
          <Input
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Mission location"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Mission Commander</label>
          <Input
            value={formData.commander}
            onChange={(e) => setFormData({ ...formData, commander: e.target.value })}
            placeholder="Assigned commander"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Detailed mission description"
          rows={3}
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Create Mission</Button>
      </div>
    </form>
  )
}

function ResourceAllocationForm({ onClose, resources }: { onClose: () => void; resources: Resource[] }) {
  const [selectedResources, setSelectedResources] = useState<string[]>([])
  const [targetMission, setTargetMission] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Allocating resources:", { selectedResources, targetMission })
    onClose()
  }

  const availableResources = resources.filter((r) => r.status === "available")

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Target Mission</label>
        <Select value={targetMission} onValueChange={setTargetMission}>
          <SelectTrigger>
            <SelectValue placeholder="Select mission" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="M-001">Structure Fire - Downtown</SelectItem>
            <SelectItem value="M-002">Search & Rescue - Pine Ridge</SelectItem>
            <SelectItem value="new">Create New Mission</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Available Resources</label>
        <div className="max-h-60 overflow-y-auto space-y-2">
          {availableResources.map((resource) => (
            <div key={resource.id} className="flex items-center space-x-2 p-2 border border-border rounded">
              <input
                type="checkbox"
                id={resource.id}
                checked={selectedResources.includes(resource.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedResources([...selectedResources, resource.id])
                  } else {
                    setSelectedResources(selectedResources.filter((id) => id !== resource.id))
                  }
                }}
              />
              <label htmlFor={resource.id} className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{resource.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {resource.type}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">{resource.capabilities.join(", ")}</div>
              </label>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={!targetMission || selectedResources.length === 0}>
          <Send className="h-4 w-4 mr-2" />
          Allocate Resources
        </Button>
      </div>
    </form>
  )
}
