"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Users,
  Shield,
  Phone,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus,
  Search,
  Filter,
  Radio,
  Truck,
  UserCheck,
  Activity,
} from "lucide-react"

interface PersonnelUnit {
  id: string
  name: string
  type: "fire" | "medical" | "police" | "sar" | "command"
  status: "available" | "deployed" | "off-duty" | "emergency"
  location: string
  currentMission?: string
  personnel: Array<{
    id: string
    name: string
    rank: string
    role: string
    status: "active" | "standby" | "off-duty"
    avatar?: string
  }>
  equipment: string[]
  capabilities: string[]
  lastUpdate: string
  responseTime: number
  contact: {
    radio: string
    phone: string
  }
}

export function PersonnelManagement() {
  const [selectedUnit, setSelectedUnit] = useState<string>("unit-001")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddPersonnelOpen, setIsAddPersonnelOpen] = useState(false)

  const personnelUnits: PersonnelUnit[] = [
    {
      id: "unit-001",
      name: "Engine 12",
      type: "fire",
      status: "deployed",
      location: "425 Main St, Downtown",
      currentMission: "M-001",
      personnel: [
        {
          id: "p-001",
          name: "Captain Sarah Chen",
          rank: "Captain",
          role: "Unit Commander",
          status: "active",
          avatar: "/placeholder-user.jpg",
        },
        {
          id: "p-002",
          name: "Lt. Mike Rodriguez",
          rank: "Lieutenant",
          role: "Engineer",
          status: "active",
        },
        {
          id: "p-003",
          name: "FF John Smith",
          rank: "Firefighter",
          role: "Firefighter",
          status: "active",
        },
        {
          id: "p-004",
          name: "FF Lisa Park",
          rank: "Firefighter",
          role: "Paramedic",
          status: "active",
        },
      ],
      equipment: ["Fire Engine", "Ladder", "Hoses", "Medical Kit", "Thermal Camera"],
      capabilities: ["Fire Suppression", "Rescue Operations", "Medical Response", "Hazmat"],
      lastUpdate: "2 min ago",
      responseTime: 4.2,
      contact: {
        radio: "Engine-12",
        phone: "(555) 0112",
      },
    },
    {
      id: "unit-002",
      name: "Ladder 7",
      type: "fire",
      status: "deployed",
      location: "425 Main St, Downtown",
      currentMission: "M-001",
      personnel: [
        {
          id: "p-005",
          name: "Captain Tom Wilson",
          rank: "Captain",
          role: "Unit Commander",
          status: "active",
        },
        {
          id: "p-006",
          name: "FF David Brown",
          rank: "Firefighter",
          role: "Tillerman",
          status: "active",
        },
        {
          id: "p-007",
          name: "FF Amy Johnson",
          rank: "Firefighter",
          role: "Firefighter",
          status: "active",
        },
      ],
      equipment: ["Ladder Truck", "Aerial Platform", "Rescue Tools", "Ventilation Equipment"],
      capabilities: ["Aerial Operations", "Ventilation", "Search & Rescue", "Technical Rescue"],
      lastUpdate: "1 min ago",
      responseTime: 3.8,
      contact: {
        radio: "Ladder-7",
        phone: "(555) 0107",
      },
    },
    {
      id: "unit-003",
      name: "SAR Team Alpha",
      type: "sar",
      status: "deployed",
      location: "Pine Ridge Trail, Sector 7",
      currentMission: "M-002",
      personnel: [
        {
          id: "p-008",
          name: "Sgt. Lisa Park",
          rank: "Sergeant",
          role: "Team Leader",
          status: "active",
        },
        {
          id: "p-009",
          name: "Officer Jake Miller",
          rank: "Officer",
          role: "Search Specialist",
          status: "active",
        },
        {
          id: "p-010",
          name: "Medic Emma Davis",
          rank: "Paramedic",
          role: "Medical Support",
          status: "active",
        },
      ],
      equipment: ["ATV", "Rescue Gear", "Medical Kit", "GPS Equipment", "Communication Gear"],
      capabilities: ["Search & Rescue", "Medical Aid", "Technical Rescue", "Wilderness Operations"],
      lastUpdate: "3 min ago",
      responseTime: 5.1,
      contact: {
        radio: "SAR-Alpha",
        phone: "(555) 0203",
      },
    },
    {
      id: "unit-004",
      name: "Rescue 3",
      type: "medical",
      status: "available",
      location: "Station 3, North District",
      personnel: [
        {
          id: "p-011",
          name: "Paramedic Chris Lee",
          rank: "Paramedic",
          role: "Unit Commander",
          status: "standby",
        },
        {
          id: "p-012",
          name: "EMT Maria Garcia",
          rank: "EMT",
          role: "Emergency Medical Tech",
          status: "standby",
        },
      ],
      equipment: ["Ambulance", "Advanced Life Support", "Defibrillator", "Oxygen", "Trauma Kit"],
      capabilities: ["Advanced Life Support", "Emergency Medical Care", "Patient Transport"],
      lastUpdate: "5 min ago",
      responseTime: 2.9,
      contact: {
        radio: "Rescue-3",
        phone: "(555) 0103",
      },
    },
    {
      id: "unit-005",
      name: "Command 1",
      type: "command",
      status: "available",
      location: "Emergency Operations Center",
      personnel: [
        {
          id: "p-013",
          name: "Chief Robert Taylor",
          rank: "Chief",
          role: "Incident Commander",
          status: "active",
        },
        {
          id: "p-014",
          name: "Deputy Chief Karen White",
          rank: "Deputy Chief",
          role: "Operations Chief",
          status: "active",
        },
      ],
      equipment: ["Command Vehicle", "Communication Suite", "Mobile Command Center"],
      capabilities: ["Incident Command", "Coordination", "Strategic Planning", "Resource Management"],
      lastUpdate: "1 min ago",
      responseTime: 1.5,
      contact: {
        radio: "Command-1",
        phone: "(555) 0101",
      },
    },
  ]

  const filteredUnits = personnelUnits.filter((unit) => {
    const matchesSearch =
      unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.personnel.some((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === "all" || unit.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const currentUnit = personnelUnits.find((unit) => unit.id === selectedUnit) || personnelUnits[0]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "deployed":
        return "operational"
      case "available":
        return "bg-chart-3/10 text-chart-3 border-chart-3/20"
      case "off-duty":
        return "bg-muted text-muted-foreground"
      case "emergency":
        return "critical-alert"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "fire":
        return <AlertTriangle className="h-4 w-4" />
      case "medical":
        return <Plus className="h-4 w-4" />
      case "police":
        return <Shield className="h-4 w-4" />
      case "sar":
        return <Search className="h-4 w-4" />
      case "command":
        return <Radio className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "fire":
        return "text-destructive"
      case "medical":
        return "text-chart-3"
      case "police":
        return "text-primary"
      case "sar":
        return "text-chart-4"
      case "command":
        return "text-accent"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Personnel Management</h2>
          <p className="text-muted-foreground">Monitor and coordinate emergency response personnel</p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isAddPersonnelOpen} onOpenChange={setIsAddPersonnelOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Personnel</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Personnel</DialogTitle>
              </DialogHeader>
              <AddPersonnelForm onClose={() => setIsAddPersonnelOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search personnel or units..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="deployed">Deployed</SelectItem>
            <SelectItem value="off-duty">Off Duty</SelectItem>
            <SelectItem value="emergency">Emergency</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personnel Units List */}
        <div className="space-y-4">
          <Card className="emergency-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <span>Personnel Units</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredUnits.map((unit) => (
                <div
                  key={unit.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedUnit === unit.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-secondary/30 hover:bg-secondary/50"
                  }`}
                  onClick={() => setSelectedUnit(unit.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={getTypeColor(unit.type)}>{getTypeIcon(unit.type)}</div>
                      <span className="font-medium text-foreground">{unit.name}</span>
                    </div>
                    <Badge className={`status-indicator ${getStatusColor(unit.status)} text-xs`}>{unit.status}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{unit.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{unit.personnel.length} personnel</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="emergency-card">
            <CardHeader>
              <CardTitle>Personnel Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-2 bg-secondary/30 rounded">
                  <div className="text-lg font-bold text-foreground">
                    {personnelUnits.filter((u) => u.status === "available").length}
                  </div>
                  <div className="text-xs text-muted-foreground">Available</div>
                </div>
                <div className="p-2 bg-secondary/30 rounded">
                  <div className="text-lg font-bold text-foreground">
                    {personnelUnits.filter((u) => u.status === "deployed").length}
                  </div>
                  <div className="text-xs text-muted-foreground">Deployed</div>
                </div>
                <div className="p-2 bg-secondary/30 rounded">
                  <div className="text-lg font-bold text-foreground">
                    {personnelUnits.reduce((acc, unit) => acc + unit.personnel.length, 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Personnel</div>
                </div>
                <div className="p-2 bg-secondary/30 rounded">
                  <div className="text-lg font-bold text-foreground">3.2</div>
                  <div className="text-xs text-muted-foreground">Avg Response</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Unit Details */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="emergency-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <div className={getTypeColor(currentUnit.type)}>{getTypeIcon(currentUnit.type)}</div>
                  <span>{currentUnit.name}</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className={`status-indicator ${getStatusColor(currentUnit.status)}`}>
                    {currentUnit.status}
                  </Badge>
                  <Button variant="outline" size="sm" className="bg-transparent">
                    <Radio className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{currentUnit.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Response: {currentUnit.responseTime} min</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Radio className="h-4 w-4 text-muted-foreground" />
                  <span>{currentUnit.contact.radio}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{currentUnit.contact.phone}</span>
                </div>
              </div>

              <Tabs defaultValue="personnel" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="personnel">Personnel</TabsTrigger>
                  <TabsTrigger value="equipment">Equipment</TabsTrigger>
                  <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
                </TabsList>

                <TabsContent value="personnel">
                  <div className="space-y-3">
                    {currentUnit.personnel.map((person) => (
                      <div key={person.id} className="flex items-center space-x-3 p-3 bg-secondary/30 rounded-lg">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={person.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {person.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-foreground">{person.name}</span>
                            <Badge
                              className={`status-indicator ${getStatusColor(person.status)} text-xs`}
                              variant="outline"
                            >
                              {person.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {person.rank} • {person.role}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="equipment">
                  <div className="grid grid-cols-2 gap-2">
                    {currentUnit.equipment.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-secondary/30 rounded">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="capabilities">
                  <div className="grid grid-cols-2 gap-2">
                    {currentUnit.capabilities.map((capability, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-secondary/30 rounded">
                        <CheckCircle className="h-4 w-4 text-chart-3" />
                        <span className="text-sm">{capability}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="emergency-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-chart-4" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="justify-start bg-transparent" size="sm">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Check-in All
                </Button>
                <Button variant="outline" className="justify-start bg-transparent" size="sm">
                  <Radio className="h-4 w-4 mr-2" />
                  Radio Check
                </Button>
                <Button variant="outline" className="justify-start bg-transparent" size="sm">
                  <MapPin className="h-4 w-4 mr-2" />
                  Update Location
                </Button>
                <Button variant="outline" className="justify-start bg-transparent" size="sm">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Emergency Alert
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function AddPersonnelForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    rank: "",
    role: "",
    unit: "",
    contact: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Adding new personnel:", formData)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Full Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter full name"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Rank</label>
          <Input
            value={formData.rank}
            onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
            placeholder="e.g., Captain"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Role</label>
          <Input
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            placeholder="e.g., Firefighter"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Assigned Unit</label>
        <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="engine-12">Engine 12</SelectItem>
            <SelectItem value="ladder-7">Ladder 7</SelectItem>
            <SelectItem value="rescue-3">Rescue 3</SelectItem>
            <SelectItem value="sar-alpha">SAR Team Alpha</SelectItem>
            <SelectItem value="command-1">Command 1</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Contact Number</label>
        <Input
          value={formData.contact}
          onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
          placeholder="Phone number"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Add Personnel</Button>
      </div>
    </form>
  )
}
