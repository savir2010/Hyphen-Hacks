"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Thermometer, Activity, Zap, Wind } from "lucide-react"

interface HeatmapData {
  x: number
  y: number
  intensity: number
  temperature?: number
  activity?: number
  signal?: number
}

interface HeatmapProps {
  droneId: string
  droneName: string
  width?: number
  height?: number
}

export function DroneHeatmap({ droneId, droneName, width = 400, height = 300 }: HeatmapProps) {
  const [heatmapType, setHeatmapType] = useState<"thermal" | "activity" | "signal" | "wind">("thermal")
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([])
  const [isLive, setIsLive] = useState(true)

  // Generate mock heatmap data
  useEffect(() => {
    const generateHeatmapData = () => {
      const data: HeatmapData[] = []
      const gridSize = 20

      for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
          // Create different patterns based on heatmap type
          let intensity = 0

          switch (heatmapType) {
            case "thermal":
              // Hot spots in center and corners
              const centerDist = Math.sqrt(Math.pow(x - gridSize / 2, 2) + Math.pow(y - gridSize / 2, 2))
              const cornerDist = Math.min(
                Math.sqrt(x * x + y * y),
                Math.sqrt((x - gridSize) * (x - gridSize) + y * y),
                Math.sqrt(x * x + (y - gridSize) * (y - gridSize)),
                Math.sqrt((x - gridSize) * (x - gridSize) + (y - gridSize) * (y - gridSize)),
              )
              intensity =
                Math.max(0, 1 - centerDist / (gridSize / 2)) * 0.8 +
                Math.max(0, 1 - cornerDist / (gridSize / 4)) * 0.6 +
                Math.random() * 0.2
              break

            case "activity":
              // Movement patterns
              intensity = Math.sin(x * 0.3) * Math.cos(y * 0.3) * 0.5 + 0.5 + Math.random() * 0.3
              break

            case "signal":
              // Signal strength gradient
              intensity = (x + y) / (2 * gridSize) + Math.random() * 0.3
              break

            case "wind":
              // Wind patterns
              intensity = Math.sin(x * 0.2 + y * 0.1) * 0.4 + 0.6 + Math.random() * 0.2
              break
          }

          data.push({
            x: (x / gridSize) * width,
            y: (y / gridSize) * height,
            intensity: Math.max(0, Math.min(1, intensity)),
            temperature: heatmapType === "thermal" ? 20 + intensity * 40 : undefined,
            activity: heatmapType === "activity" ? intensity * 100 : undefined,
            signal: heatmapType === "signal" ? intensity * 100 : undefined,
          })
        }
      }

      setHeatmapData(data)
    }

    generateHeatmapData()

    // Update data every 2 seconds if live
    const interval = isLive ? setInterval(generateHeatmapData, 2000) : null

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [heatmapType, isLive, width, height])

  const getHeatmapColor = (intensity: number) => {
    // White to tan to blue gradient
    if (intensity < 0.33) {
      const t = intensity / 0.33
      return `rgb(${255 - t * 50}, ${248 - t * 30}, ${240 - t * 40})`
    } else if (intensity < 0.66) {
      const t = (intensity - 0.33) / 0.33
      return `rgb(${205 - t * 50}, ${218 - t * 60}, ${200 - t * 80})`
    } else {
      const t = (intensity - 0.66) / 0.34
      return `rgb(${155 - t * 95}, ${158 - t * 108}, ${120 + t * 120})`
    }
  }

  const getTypeIcon = () => {
    switch (heatmapType) {
      case "thermal":
        return <Thermometer className="h-4 w-4" />
      case "activity":
        return <Activity className="h-4 w-4" />
      case "signal":
        return <Zap className="h-4 w-4" />
      case "wind":
        return <Wind className="h-4 w-4" />
    }
  }

  const getTypeLabel = () => {
    switch (heatmapType) {
      case "thermal":
        return "Thermal"
      case "activity":
        return "Activity"
      case "signal":
        return "Signal"
      case "wind":
        return "Wind"
    }
  }

  const getIntensityLabel = (intensity: number) => {
    switch (heatmapType) {
      case "thermal":
        return `${(20 + intensity * 40).toFixed(1)}°C`
      case "activity":
        return `${(intensity * 100).toFixed(0)}%`
      case "signal":
        return `${(intensity * 100).toFixed(0)}%`
      case "wind":
        return `${(intensity * 25).toFixed(1)} mph`
    }
  }

  return (
    <Card className="w-full border-0 bg-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CardTitle className="text-lg text-stone-800">{droneName} Heatmap</CardTitle>
            <div className="p-1 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">{getTypeIcon()}</div>
            <Badge
              className={`${isLive ? "shiny-button text-white" : "bg-stone-200 text-stone-700"} transition-all duration-200`}
            >
              {isLive ? "LIVE" : "PAUSED"}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={heatmapType} onValueChange={(value: any) => setHeatmapType(value)}>
              <SelectTrigger className="w-32 glass-effect border-stone-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-effect">
                <SelectItem value="thermal">Thermal</SelectItem>
                <SelectItem value="activity">Activity</SelectItem>
                <SelectItem value="signal">Signal</SelectItem>
                <SelectItem value="wind">Wind</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              className={isLive ? "shiny-button" : "glass-effect text-stone-700 hover:bg-stone-100"}
              onClick={() => setIsLive(!isLive)}
            >
              {isLive ? "Pause" : "Resume"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Heatmap Visualization */}
          <div className="relative glass-effect rounded-xl overflow-hidden shadow-2xl">
            <svg width={width} height={height} className="block">
              {heatmapData.map((point, index) => (
                <circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r={Math.max(2, point.intensity * 8)}
                  fill={getHeatmapColor(point.intensity)}
                  opacity={0.8}
                  className="transition-all duration-500 hover:opacity-100"
                />
              ))}

              {/* Grid overlay */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#d4b896" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" opacity="0.2" />
            </svg>

            {/* Legend */}
            <div className="absolute top-2 right-2 glass-effect rounded-lg p-3 text-xs shadow-lg">
              <div className="font-semibold mb-2 text-stone-800">{getTypeLabel()} Intensity</div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full shadow-sm"
                    style={{ backgroundColor: getHeatmapColor(0.1) }}
                  ></div>
                  <span className="text-stone-600">Low</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full shadow-sm"
                    style={{ backgroundColor: getHeatmapColor(0.5) }}
                  ></div>
                  <span className="text-stone-600">Med</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full shadow-sm"
                    style={{ backgroundColor: getHeatmapColor(0.9) }}
                  ></div>
                  <span className="text-stone-600">High</span>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center p-3 glass-effect rounded-lg shadow-lg">
              <div className="font-semibold text-stone-800">Max</div>
              <div className="text-blue-600 font-medium">
                {getIntensityLabel(Math.max(...heatmapData.map((d) => d.intensity)))}
              </div>
            </div>
            <div className="text-center p-3 glass-effect rounded-lg shadow-lg">
              <div className="font-semibold text-stone-800">Avg</div>
              <div className="text-blue-600 font-medium">
                {getIntensityLabel(heatmapData.reduce((sum, d) => sum + d.intensity, 0) / heatmapData.length)}
              </div>
            </div>
            <div className="text-center p-3 glass-effect rounded-lg shadow-lg">
              <div className="font-semibold text-stone-800">Points</div>
              <div className="text-blue-600 font-medium">{heatmapData.length}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
