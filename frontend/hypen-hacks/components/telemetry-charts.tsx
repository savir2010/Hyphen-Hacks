"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
} from "recharts"
import { Activity, Zap, Thermometer, Signal, Gauge, TrendingUp } from "lucide-react"

interface TelemetryDataPoint {
  time: string
  timestamp: number
  value: number
}

interface AdvancedTelemetryData {
  time: string
  timestamp: number
  vibration: number
  rotorRPM: number
  powerConsumption: number
  missionProgress: number
}

export function TelemetryCharts() {
  const [batteryData, setBatteryData] = useState<TelemetryDataPoint[]>([])
  const [altitudeData, setAltitudeData] = useState<TelemetryDataPoint[]>([])
  const [signalData, setSignalData] = useState<TelemetryDataPoint[]>([])
  const [temperatureData, setTemperatureData] = useState<TelemetryDataPoint[]>([])
  const [speedData, setSpeedData] = useState<TelemetryDataPoint[]>([])
  const [advancedData, setAdvancedData] = useState<AdvancedTelemetryData[]>([])
  const [isLiveMode, setIsLiveMode] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("connected")

  const generateInitialData = (baseValue: number, variance: number, points = 30): TelemetryDataPoint[] => {
    const now = Date.now()
    return Array.from({ length: points }, (_, i) => {
      const timestamp = now - (points - i) * 2000 // 2 second intervals
      const time = new Date(timestamp).toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })

      return {
        time,
        timestamp,
        value: Math.max(0, Math.min(100, baseValue + Math.sin(i * 0.1) * variance + (Math.random() - 0.5) * 10)),
      }
    })
  }

  useEffect(() => {
    setBatteryData(generateInitialData(87, 15))
    setAltitudeData(generateInitialData(150, 40))
    setSignalData(generateInitialData(95, 8))
    setTemperatureData(generateInitialData(22, 8))
    setSpeedData(generateInitialData(25, 12))

    // Initialize advanced telemetry data for single drone
    const initialAdvanced: AdvancedTelemetryData[] = Array.from({ length: 30 }, (_, i) => {
      const timestamp = Date.now() - (30 - i) * 2000
      const time = new Date(timestamp).toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })

      return {
        time,
        timestamp,
        vibration: Math.max(0, Math.min(10, 2.3 + Math.sin(i * 0.1) * 1.5 + (Math.random() - 0.5) * 0.8)),
        rotorRPM: Math.max(1000, Math.min(3000, 1850 + Math.sin(i * 0.1) * 300 + (Math.random() - 0.5) * 100)),
        powerConsumption: Math.max(50, Math.min(200, 120 + Math.sin(i * 0.1) * 30 + (Math.random() - 0.5) * 20)),
        missionProgress: Math.min(100, (i / 30) * 100 + (Math.random() - 0.5) * 5),
      }
    })
    setAdvancedData(initialAdvanced)
  }, [])

  useEffect(() => {
    if (!isLiveMode) return

    const interval = setInterval(() => {
      const now = Date.now()
      const timeString = new Date(now).toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })

      const updateSingleDroneData = (prevData: TelemetryDataPoint[], baseValue: number) => {
        const newPoint = {
          time: timeString,
          timestamp: now,
          value: Math.max(0, Math.min(100, baseValue + (Math.random() - 0.5) * 8)),
        }
        return [...prevData.slice(-29), newPoint] // Keep last 30 points
      }

      setBatteryData((prev) => {
        const lastPoint = prev[prev.length - 1]
        return updateSingleDroneData(prev, lastPoint?.value || 87)
      })

      setAltitudeData((prev) => {
        const lastPoint = prev[prev.length - 1]
        return updateSingleDroneData(prev, lastPoint?.value || 150)
      })

      setSignalData((prev) => {
        const lastPoint = prev[prev.length - 1]
        return updateSingleDroneData(prev, lastPoint?.value || 95)
      })

      setTemperatureData((prev) => {
        const lastPoint = prev[prev.length - 1]
        return updateSingleDroneData(prev, lastPoint?.value || 22)
      })

      setSpeedData((prev) => {
        const lastPoint = prev[prev.length - 1]
        return updateSingleDroneData(prev, lastPoint?.value || 25)
      })

      // Update advanced telemetry data for single drone
      setAdvancedData((prev) => {
        const lastPoint = prev[prev.length - 1]
        const newPoint: AdvancedTelemetryData = {
          time: timeString,
          timestamp: now,
          vibration: Math.max(0, Math.min(10, lastPoint.vibration + (Math.random() - 0.5) * 0.5)),
          rotorRPM: Math.max(1000, Math.min(3000, lastPoint.rotorRPM + (Math.random() - 0.5) * 50)),
          powerConsumption: Math.max(50, Math.min(200, lastPoint.powerConsumption + (Math.random() - 0.5) * 10)),
          missionProgress: Math.min(100, lastPoint.missionProgress + Math.random() * 2),
        }
        return [...prev.slice(-29), newPoint]
      })

      console.log("[v0] Single drone telemetry charts updated")
    }, 2000)

    return () => clearInterval(interval)
  }, [isLiveMode])

  const CustomTooltip = ({ active, payload, label, unit = "" }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border/50 rounded-lg p-4 shadow-xl backdrop-blur-sm">
          <p className="telemetry-label mb-3">{`Time: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between space-x-6 mb-1">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
                <span className="status-text">Eagle-1</span>
              </div>
              <span className="telemetry-value text-sm" style={{ color: entry.color }}>
                {typeof entry.value === "number" ? entry.value.toFixed(1) : entry.value}
                {unit}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 emergency-heading">
            <Activity className="h-5 w-5 text-chart-1" />
            <span>Real-Time Telemetry - Eagle-1</span>
          </CardTitle>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === "connected"
                    ? "bg-green-500 animate-pulse"
                    : connectionStatus === "connecting"
                      ? "bg-yellow-500 animate-pulse"
                      : "bg-red-500"
                }`}
              />
              <span className="telemetry-label text-xs capitalize">{connectionStatus}</span>
            </div>

            <Button
              variant={isLiveMode ? "default" : "outline"}
              size="sm"
              onClick={() => setIsLiveMode(!isLiveMode)}
              className="status-text text-xs"
            >
              {isLiveMode ? "Live" : "Paused"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="battery" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="battery" className="status-text">
              <Zap className="h-4 w-4 mr-1" />
              Battery
            </TabsTrigger>
            <TabsTrigger value="altitude" className="status-text">
              <TrendingUp className="h-4 w-4 mr-1" />
              Altitude
            </TabsTrigger>
            <TabsTrigger value="signal" className="status-text">
              <Signal className="h-4 w-4 mr-1" />
              Signal
            </TabsTrigger>
            <TabsTrigger value="temperature" className="status-text">
              <Thermometer className="h-4 w-4 mr-1" />
              Temp
            </TabsTrigger>
            <TabsTrigger value="speed" className="status-text">
              <Gauge className="h-4 w-4 mr-1" />
              Speed
            </TabsTrigger>
            <TabsTrigger value="advanced" className="status-text">
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="battery" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={batteryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="time"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    interval="preserveStartEnd"
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip unit="%" />} />
                  <ReferenceLine y={20} stroke="hsl(var(--destructive))" strokeDasharray="5 5" />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={3}
                    dot={false}
                    name="Eagle-1"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="altitude" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={altitudeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="time"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    interval="preserveStartEnd"
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip content={<CustomTooltip unit="ft" />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--chart-1))"
                    fill="hsl(var(--chart-1))"
                    fillOpacity={0.3}
                    name="Eagle-1"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="signal" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={signalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="time"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    interval="preserveStartEnd"
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip unit="%" />} />
                  <ReferenceLine y={70} stroke="hsl(var(--chart-3))" strokeDasharray="5 5" />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={3}
                    dot={false}
                    name="Eagle-1"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="temperature" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={temperatureData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="time"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    interval="preserveStartEnd"
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip content={<CustomTooltip unit="°C" />} />
                  <ReferenceLine y={50} stroke="hsl(var(--destructive))" strokeDasharray="5 5" />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={3}
                    dot={false}
                    name="Eagle-1"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="speed" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={speedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="time"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    interval="preserveStartEnd"
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip content={<CustomTooltip unit=" mph" />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--chart-1))"
                    fill="hsl(var(--chart-1))"
                    fillOpacity={0.4}
                    name="Eagle-1"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Vibration Chart */}
              <Card className="border-border/30">
                <CardHeader className="pb-3">
                  <CardTitle className="emergency-heading text-base">Vibration Levels</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={advancedData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="time"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={11}
                          interval="preserveStartEnd"
                          className="data-display"
                        />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} className="data-display" />
                        <Tooltip content={<CustomTooltip unit=" g" />} />
                        <ReferenceLine y={3} stroke="hsl(var(--destructive))" strokeDasharray="5 5" />
                        <Line
                          type="monotone"
                          dataKey="vibration"
                          stroke="hsl(var(--chart-1))"
                          strokeWidth={3}
                          dot={false}
                          name="Eagle-1"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Rotor RPM Chart */}
              <Card className="border-border/30">
                <CardHeader className="pb-3">
                  <CardTitle className="emergency-heading text-base">Rotor RPM</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={advancedData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="time"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={11}
                          interval="preserveStartEnd"
                          className="data-display"
                        />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} className="data-display" />
                        <Tooltip content={<CustomTooltip unit=" RPM" />} />
                        <Area
                          type="monotone"
                          dataKey="rotorRPM"
                          stroke="hsl(var(--chart-1))"
                          fill="hsl(var(--chart-1))"
                          fillOpacity={0.3}
                          name="Eagle-1"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Power Consumption Chart */}
              <Card className="border-border/30">
                <CardHeader className="pb-3">
                  <CardTitle className="emergency-heading text-base">Power Consumption</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={advancedData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="time"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={11}
                          interval="preserveStartEnd"
                          className="data-display"
                        />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} className="data-display" />
                        <Tooltip content={<CustomTooltip unit="W" />} />
                        <Line
                          type="monotone"
                          dataKey="powerConsumption"
                          stroke="hsl(var(--chart-1))"
                          strokeWidth={3}
                          dot={false}
                          name="Eagle-1"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Mission Progress Chart */}
              <Card className="border-border/30">
                <CardHeader className="pb-3">
                  <CardTitle className="emergency-heading text-base">Mission Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={advancedData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="time"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={11}
                          interval="preserveStartEnd"
                          className="data-display"
                        />
                        <YAxis
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={11}
                          domain={[0, 100]}
                          className="data-display"
                        />
                        <Tooltip content={<CustomTooltip unit="%" />} />
                        <Line
                          type="monotone"
                          dataKey="missionProgress"
                          stroke="hsl(var(--chart-1))"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                          name="Eagle-1"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
