"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Radio,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Users,
  AlertTriangle,
  Clock,
  Phone,
  MessageSquare,
  Zap,
} from "lucide-react"

interface Message {
  id: string
  sender: string
  content: string
  timestamp: string
  type: "text" | "audio" | "alert" | "system"
  channel: string
  priority?: "low" | "normal" | "high" | "critical"
}

interface RadioChannel {
  id: string
  name: string
  frequency: string
  active: boolean
  participants: number
}

interface TeamMember {
  id: string
  name: string
  role: string
  status: "online" | "busy" | "away" | "offline"
  location?: string
}

export function CommunicationsCenter() {
  const [activeChannel, setActiveChannel] = useState("command")
  const [newMessage, setNewMessage] = useState("")
  const [isMuted, setIsMuted] = useState(false)
  const [isTransmitting, setIsTransmitting] = useState(false)
  const [selectedRadioChannel, setSelectedRadioChannel] = useState("CH-1")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const radioChannels: RadioChannel[] = [
    { id: "CH-1", name: "Command", frequency: "154.265", active: true, participants: 8 },
    { id: "CH-2", name: "Fire Ops", frequency: "154.280", active: true, participants: 4 },
    { id: "CH-3", name: "Medical", frequency: "155.340", active: false, participants: 2 },
    { id: "CH-4", name: "Search & Rescue", frequency: "154.295", active: true, participants: 6 },
    { id: "CH-5", name: "Air Support", frequency: "123.025", active: true, participants: 3 },
  ]

  const teamMembers: TeamMember[] = [
    { id: "1", name: "Sarah Chen", role: "Incident Commander", status: "online", location: "Command Post" },
    { id: "2", name: "Mike Rodriguez", role: "Fire Captain", status: "busy", location: "Scene Alpha" },
    { id: "3", name: "Emma Thompson", role: "Drone Operator", status: "online", location: "Mobile Unit 1" },
    { id: "4", name: "James Wilson", role: "Paramedic", status: "away", location: "Hospital" },
    { id: "5", name: "Lisa Park", role: "SAR Coordinator", status: "online", location: "Base Camp" },
  ]

  const messages: Message[] = [
    {
      id: "1",
      sender: "System",
      content: "Emergency communications channel activated",
      timestamp: "14:20",
      type: "system",
      channel: "command",
    },
    {
      id: "2",
      sender: "Sarah Chen",
      content: "All units, we have a structure fire at 425 Main St. Deploying drones for thermal imaging.",
      timestamp: "14:23",
      type: "text",
      channel: "command",
      priority: "high",
    },
    {
      id: "3",
      sender: "Emma Thompson",
      content: "Drone Eagle-1 is airborne and approaching target. ETA 2 minutes.",
      timestamp: "14:25",
      type: "text",
      channel: "command",
    },
    {
      id: "4",
      sender: "Mike Rodriguez",
      content: "Fire suppression team in position. Awaiting thermal data from drones.",
      timestamp: "14:27",
      type: "text",
      channel: "command",
    },
    {
      id: "5",
      sender: "System",
      content: "CRITICAL ALERT: Thermal imaging shows heat signatures on 3rd floor",
      timestamp: "14:30",
      type: "alert",
      channel: "command",
      priority: "critical",
    },
    {
      id: "6",
      sender: "Sarah Chen",
      content: "Copy that. All units be advised - potential occupants on 3rd floor. Proceed with caution.",
      timestamp: "14:31",
      type: "text",
      channel: "command",
      priority: "high",
    },
  ]

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log(`[v0] Sending message to ${activeChannel}: ${newMessage}`)
      setNewMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleTransmit = () => {
    setIsTransmitting(!isTransmitting)
    console.log(`[v0] Radio transmission ${!isTransmitting ? "started" : "stopped"}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-chart-3 h-2 w-2 rounded-full"
      case "busy":
        return "bg-destructive h-2 w-2 rounded-full"
      case "away":
        return "bg-chart-4 h-2 w-2 rounded-full"
      case "offline":
        return "bg-muted h-2 w-2 rounded-full"
      default:
        return "bg-muted h-2 w-2 rounded-full"
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "critical":
        return "border-l-4 border-destructive bg-destructive/5"
      case "high":
        return "border-l-4 border-chart-4 bg-chart-4/5"
      case "normal":
        return "border-l-4 border-primary bg-primary/5"
      default:
        return ""
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Communications Center</h2>
          <p className="text-muted-foreground">Real-time team coordination and emergency communications</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={isMuted ? "destructive" : "outline"}
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
            className="flex items-center space-x-1"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            <span>{isMuted ? "Unmute" : "Mute"}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Communications Panel */}
        <div className="lg:col-span-2 space-y-4">
          <Tabs value={activeChannel} onValueChange={setActiveChannel}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="command">Command</TabsTrigger>
              <TabsTrigger value="field">Field Ops</TabsTrigger>
              <TabsTrigger value="medical">Medical</TabsTrigger>
              <TabsTrigger value="air">Air Support</TabsTrigger>
            </TabsList>

            <TabsContent value={activeChannel}>
              <Card className="emergency-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <span className="capitalize">{activeChannel} Channel</span>
                    <Badge variant="outline" className="operational">
                      Active
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Messages Area */}
                  <ScrollArea className="h-96 w-full border border-border rounded-lg p-4">
                    <div className="space-y-3">
                      {messages
                        .filter((msg) => msg.channel === activeChannel)
                        .map((message) => (
                          <div
                            key={message.id}
                            className={`p-3 rounded-lg ${
                              message.type === "system"
                                ? "bg-secondary text-center text-sm text-muted-foreground"
                                : message.type === "alert"
                                  ? "bg-destructive/10 border border-destructive/20"
                                  : `bg-card ${getPriorityColor(message.priority)}`
                            }`}
                          >
                            {message.type === "system" ? (
                              <div className="flex items-center justify-center space-x-2">
                                <Clock className="h-3 w-3" />
                                <span>{message.content}</span>
                                <span className="text-xs">({message.timestamp})</span>
                              </div>
                            ) : message.type === "alert" ? (
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <AlertTriangle className="h-4 w-4 text-destructive" />
                                  <span className="font-semibold text-destructive">CRITICAL ALERT</span>
                                  <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                                </div>
                                <p className="text-sm">{message.content}</p>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-sm">{message.sender}</span>
                                  <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                                </div>
                                <p className="text-sm text-foreground">{message.content}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={`Send message to ${activeChannel} channel...`}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Radio Communications */}
          <Card className="emergency-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Radio className="h-5 w-5 text-accent" />
                <span>Radio Communications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Active Channel</label>
                  <Select value={selectedRadioChannel} onValueChange={setSelectedRadioChannel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {radioChannels.map((channel) => (
                        <SelectItem key={channel.id} value={channel.id}>
                          <div className="flex items-center space-x-2">
                            <span>{channel.name}</span>
                            <span className="text-xs text-muted-foreground">({channel.frequency} MHz)</span>
                            {channel.active && <div className="h-2 w-2 bg-chart-3 rounded-full" />}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Participants</label>
                  <div className="flex items-center space-x-2 p-2 bg-secondary rounded-lg">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {radioChannels.find((ch) => ch.id === selectedRadioChannel)?.participants || 0} active
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant={isTransmitting ? "destructive" : "default"}
                  size="lg"
                  onClick={toggleTransmit}
                  className="flex items-center space-x-2 px-8"
                >
                  {isTransmitting ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  <span>{isTransmitting ? "Release to Stop" : "Push to Talk"}</span>
                </Button>
              </div>

              {isTransmitting && (
                <div className="text-center p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-center justify-center space-x-2 text-destructive">
                    <div className="h-2 w-2 bg-destructive rounded-full animate-pulse" />
                    <span className="text-sm font-medium">TRANSMITTING ON {selectedRadioChannel}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Team Status & Quick Actions */}
        <div className="space-y-4">
          {/* Team Members */}
          <Card className="emergency-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <span>Team Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-secondary/50">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium truncate">{member.name}</p>
                          <div className={getStatusColor(member.status)} />
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                        {member.location && <p className="text-xs text-muted-foreground truncate">{member.location}</p>}
                      </div>
                      <Button variant="ghost" size="sm">
                        <Phone className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

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
                Emergency Broadcast
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                <Radio className="h-4 w-4 mr-2" />
                All Call
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Team Assembly
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Status Update
              </Button>
            </CardContent>
          </Card>

          {/* Radio Channels Overview */}
          <Card className="emergency-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Radio className="h-5 w-5 text-accent" />
                <span>Radio Channels</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {radioChannels.map((channel) => (
                  <div key={channel.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                    <div className="flex items-center space-x-2">
                      <div className={`h-2 w-2 rounded-full ${channel.active ? "bg-chart-3" : "bg-muted"}`} />
                      <span className="text-sm font-medium">{channel.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{channel.participants}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
