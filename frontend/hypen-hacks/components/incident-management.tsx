"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  AlertTriangle,
  Clock,
  MapPin,
  Eye,
  Plus,
  Users,
  Bone as Drone,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"

interface Incident {
  id: string
  title: string
  description: string
  status: "active" | "pending" | "resolved" | "cancelled"
  priority: "critical" | "high" | "medium" | "low"
  type: "fire" | "medical" | "search_rescue" | "traffic" | "natural_disaster" | "security"
  location: string
  coordinates: { lat: number; lng: number }
  reportedBy: string
  assignedDrones: string[]
  assignedPersonnel: string[]
  startTime: string
  estimatedDuration: number
  progress: number
  updates: Array<{
    id: string
    timestamp: string
    message: string
    author: string
    type: "info" | "warning" | "success" | "error"
  }>
}

export function IncidentManagement() {
  const [selectedTab, setSelectedTab] = useState("active")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)

  const incidents: Incident[] = [
    {
      id: "INC-001",
      title: "Structure Fire - Downtown Commercial Building",
      description: "Multi-story commercial building fire with potential trapped occupants",
      status: "active",
      priority: "critical",
      type: "fire",
      location: "425 Main St, Downtown",
      coordinates: { lat: 40.7128, lng: -74.006 },
      reportedBy: "Fire Dispatch",
      assignedDrones: ["D-001", "D-002", "D-003"],
      assignedPersonnel: ["Unit-1", "Unit-2", "Unit-3", "Unit-4"],
      startTime: "14:23",
      estimatedDuration: 180,
      progress: 35,
      updates: [
        {
          id: "1",
          timestamp: "14:45",
          message: "Thermal imaging shows heat signatures on 3rd floor",
          author: "Drone Operator",
          type: "warning",
        },
        {
          id: "2",
          timestamp: "14:30",
          message: "All drones deployed and operational",
          author: "Command Center",
          type: "success",
        },
      ],
    },
    {
      id: "INC-002",
      title: "Search & Rescue - Missing Hiker",
      description: "Missing hiker in Pine Ridge Trail area, last seen 6 hours ago",
      status: "active",
      priority: "high",
      type: "search_rescue",
      location: "Pine Ridge Trail, Sector 7",
      coordinates: { lat: 40.7589, lng: -73.9851 },
      reportedBy: "Park Ranger",
      assignedDrones: ["D-004", "D-005"],
      assignedPersonnel: ["SAR-1", "SAR-2", "SAR-3"],
      startTime: "13:45",
      estimatedDuration: 240,
      progress: 60,
      updates: [
        {
          id: "1",
          timestamp: "15:20",
          message: "Drone spotted potential target 2km north of last known position",
          author: "SAR Team",
          type: "info",
        },
      ],
    },
    {
      id: "INC-003",
      title: "Traffic Incident - Multi-Vehicle Collision",
      description: "3-vehicle collision blocking highway lanes",
      status: "pending",
      priority: "medium",
      type: "traffic",
      location: "Highway 101, Mile Marker 23",
      coordinates: { lat: 40.7505, lng: -73.9934 },
      reportedBy: "Highway Patrol",
      assignedDrones: ["D-006"],
      assignedPersonnel: ["Traffic-1", "Traffic-2"],
      startTime: "15:10",
      estimatedDuration: 90,
      progress: 0,
      updates: [],
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "operational"
      case "pending":
        return "warning"
      case "resolved":
        return "bg-chart-3/10 text-chart-3 border-chart-3/20"
      case "cancelled":
        return "bg-muted text-muted-foreground border-muted"
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "fire":
        return AlertTriangle
      case "medical":
        return Plus
      case "search_rescue":
        return Users
      case "traffic":
        return AlertCircle
      case "natural_disaster":
        return AlertTriangle
      case "security":
        return AlertCircle
      default:
        return AlertTriangle
    }
  }

  const filteredIncidents = incidents.filter((incident) => {
    if (selectedTab === "all") return true
    return incident.status === selectedTab
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Incident Management</h2>
          <p className="text-muted-foreground">Monitor and coordinate emergency response incidents</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>New Incident</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Incident</DialogTitle>
            </DialogHeader>
            <CreateIncidentForm onClose={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({incidents.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({incidents.filter((i) => i.status === "active").length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({incidents.filter((i) => i.status === "pending").length})</TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved ({incidents.filter((i) => i.status === "resolved").length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({incidents.filter((i) => i.status === "cancelled").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          <div className="grid gap-4">
            {filteredIncidents.map((incident) => {
              const TypeIcon = getTypeIcon(incident.type)
              return (
                <Card key={incident.id} className="emergency-card">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <TypeIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold text-foreground">{incident.title}</h3>
                            <Badge className={`status-indicator ${getStatusColor(incident.status)}`}>
                              {incident.status}
                            </Badge>
                            <Badge className={`status-indicator ${getPriorityColor(incident.priority)}`}>
                              {incident.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{incident.description}</p>
                          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{incident.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>Started: {incident.startTime}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Drone className="h-3 w-3" />
                              <span>{incident.assignedDrones.length} drones</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="h-3 w-3" />
                              <span>{incident.assignedPersonnel.length} personnel</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedIncident(incident)}>
                          <Eye className="h-3 w-3 mr-1" />
                          Details
                        </Button>
                      </div>
                    </div>

                    {incident.status === "active" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{incident.progress}%</span>
                        </div>
                        <Progress value={incident.progress} className="h-2" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Incident Details Dialog */}
      {selectedIncident && (
        <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <span>{selectedIncident.title}</span>
                <Badge className={`status-indicator ${getStatusColor(selectedIncident.status)}`}>
                  {selectedIncident.status}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            <IncidentDetails incident={selectedIncident} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function CreateIncidentForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    priority: "",
    location: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Creating new incident:", formData)
    // Handle incident creation
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Incident Type</label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fire">Fire</SelectItem>
              <SelectItem value="medical">Medical Emergency</SelectItem>
              <SelectItem value="search_rescue">Search & Rescue</SelectItem>
              <SelectItem value="traffic">Traffic Incident</SelectItem>
              <SelectItem value="natural_disaster">Natural Disaster</SelectItem>
              <SelectItem value="security">Security</SelectItem>
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
        <label className="text-sm font-medium">Title</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Brief incident title"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Location</label>
        <Input
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="Incident location"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Detailed incident description"
          rows={3}
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Create Incident</Button>
      </div>
    </form>
  )
}

function IncidentDetails({ incident }: { incident: Incident }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-foreground mb-2">Incident Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID:</span>
                <span className="font-mono">{incident.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="capitalize">{incident.type.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reported by:</span>
                <span>{incident.reportedBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Started:</span>
                <span>{incident.startTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Est. Duration:</span>
                <span>{incident.estimatedDuration} min</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-2">Resources Assigned</h4>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Drones:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {incident.assignedDrones.map((drone) => (
                    <Badge key={drone} variant="outline" className="text-xs">
                      {drone}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Personnel:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {incident.assignedPersonnel.map((person) => (
                    <Badge key={person} variant="outline" className="text-xs">
                      {person}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-foreground mb-2">Location</h4>
            <div className="text-sm space-y-1">
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span>{incident.location}</span>
              </div>
              <div className="text-muted-foreground font-mono text-xs">
                {incident.coordinates.lat.toFixed(4)}, {incident.coordinates.lng.toFixed(4)}
              </div>
            </div>
          </div>

          {incident.status === "active" && (
            <div>
              <h4 className="font-medium text-foreground mb-2">Progress</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completion</span>
                  <span className="font-medium">{incident.progress}%</span>
                </div>
                <Progress value={incident.progress} className="h-2" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-foreground mb-3">Recent Updates</h4>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {incident.updates.map((update) => (
            <div key={update.id} className="flex space-x-3 p-3 bg-secondary/50 rounded-lg">
              <div className="flex-shrink-0">
                {update.type === "success" && <CheckCircle className="h-4 w-4 text-chart-3" />}
                {update.type === "warning" && <AlertTriangle className="h-4 w-4 text-chart-4" />}
                {update.type === "error" && <XCircle className="h-4 w-4 text-destructive" />}
                {update.type === "info" && <AlertCircle className="h-4 w-4 text-primary" />}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm text-foreground">{update.message}</p>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span>{update.timestamp}</span>
                  <span>•</span>
                  <span>{update.author}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
