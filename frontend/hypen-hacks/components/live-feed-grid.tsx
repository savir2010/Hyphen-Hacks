"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Maximize2, Volume2, VolumeX, CreditCard as Record, Signal, Battery, Video } from "lucide-react"

interface DroneStream {
  id: string
  name: string
  status: "live" | "offline"
  signal: number
  battery: number
  recording: boolean
  audio: boolean
  altitude: number
  mission?: string
}

export function LiveFeedGrid() {
  const [selectedFeed, setSelectedFeed] = useState<string | null>("eagle-1")

  const stream: DroneStream = {
    id: "eagle-1",
    name: "Eagle-1",
    status: "live",
    signal: 95,
    battery: 87,
    recording: true,
    audio: true,
    altitude: 150,
    mission: "M-001",
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "operational"
      case "offline":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const toggleAudio = () => {
    console.log(`[v0] Toggling audio for stream: ${stream.id}`)
  }

  const toggleRecording = () => {
    console.log(`[v0] Toggling recording for stream: ${stream.id}`)
  }

  const maximizeFeed = () => {
    console.log(`[v0] Maximizing feed: ${stream.id}`)
  }

  return (
    <div className="space-y-6">
      {/* Feed Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Video className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Active Feed: {stream.status === "live" ? "1" : "0"}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-chart-3 rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">Live Streaming</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={toggleRecording}>
            <Record className="h-4 w-4 mr-2" />
            {stream.recording ? "Stop Recording" : "Start Recording"}
          </Button>
        </div>
      </div>

      {/* Single Feed Display */}
      <div className="max-w-4xl mx-auto">
        <Card
          className={`emergency-card overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg ${
            selectedFeed === stream.id ? "ring-2 ring-primary shadow-lg" : ""
          }`}
          onClick={() => setSelectedFeed(stream.id)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h3 className="font-semibold text-foreground text-lg">{stream.name}</h3>
                <Badge className={`status-indicator ${getStatusColor(stream.status)}`}>{stream.status}</Badge>
                {stream.mission && (
                  <Badge variant="outline" className="text-sm">
                    {stream.mission}
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Signal className="h-4 w-4" />
                  <span>{stream.signal}%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Battery className="h-4 w-4" />
                  <span>{stream.battery}%</span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="relative aspect-video bg-black group">
              {stream.status === "live" ? (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
                    <div className="absolute inset-4 border border-primary/20 rounded">
                      {/* Simulated drone camera elements */}
                      <div className="absolute top-2 left-2 w-8 h-8 bg-destructive/60 rounded-full animate-pulse" />
                      <div className="absolute bottom-4 right-4 w-12 h-6 bg-primary/60 rounded flex items-center justify-center text-xs text-white">
                        HD
                      </div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-chart-3/60 rounded-full" />

                      {/* Crosshair overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border border-chart-3/40">
                          <div className="absolute top-1/2 left-0 w-full h-px bg-chart-3/40" />
                          <div className="absolute left-1/2 top-0 w-px h-full bg-chart-3/40" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Live indicator */}
                  <div className="absolute top-3 left-3 flex items-center space-x-1 bg-destructive text-destructive-foreground px-3 py-1 rounded text-sm font-medium">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span>LIVE</span>
                  </div>

                  {/* Recording indicator */}
                  {stream.recording && (
                    <div className="absolute top-3 right-3 flex items-center space-x-1 bg-destructive text-destructive-foreground px-3 py-1 rounded text-sm font-medium">
                      <Record className="w-3 h-3 fill-current" />
                      <span>REC</span>
                    </div>
                  )}

                  {/* Altitude display */}
                  <div className="absolute bottom-3 left-3 bg-black/70 text-white px-3 py-1 rounded text-sm font-mono">
                    ALT: {stream.altitude}m
                  </div>

                  {/* Timestamp */}
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white px-3 py-1 rounded text-sm font-mono">
                    {new Date().toLocaleTimeString()}
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <div className="text-center text-muted-foreground">
                    <Video className="h-12 w-12 mx-auto mb-4" />
                    <p className="text-lg font-medium">Feed Offline</p>
                    <p className="text-sm">Drone not responding</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-card border-t border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button
                    size="default"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleAudio()
                    }}
                    className={stream.audio ? "text-chart-3" : "text-muted-foreground"}
                  >
                    {stream.audio ? <Volume2 className="h-4 w-4 mr-2" /> : <VolumeX className="h-4 w-4 mr-2" />}
                    {stream.audio ? "Mute" : "Unmute"}
                  </Button>
                  <Button
                    size="default"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleRecording()
                    }}
                    className={stream.recording ? "text-destructive" : "text-muted-foreground"}
                  >
                    <Record className="h-4 w-4 mr-2" />
                    {stream.recording ? "Stop" : "Record"}
                  </Button>
                  <Button
                    size="default"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      maximizeFeed()
                    }}
                  >
                    <Maximize2 className="h-4 w-4 mr-2" />
                    Fullscreen
                  </Button>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2 text-sm">
                    <Signal className="h-4 w-4 text-muted-foreground" />
                    <Progress value={stream.signal} className="w-16 h-2" />
                    <span className="text-muted-foreground w-10">{stream.signal}%</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Battery className="h-4 w-4 text-muted-foreground" />
                    <Progress value={stream.battery} className="w-16 h-2" />
                    <span className="text-muted-foreground w-10">{stream.battery}%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
