"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, AlertCircle, Info, CheckCircle, X } from "lucide-react"

interface Alert {
  id: string
  type: "critical" | "warning" | "info" | "success"
  title: string
  message: string
  timestamp: string
  source: string
  acknowledged: boolean
}

export function SystemAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: "alert-1",
      type: "warning",
      title: "Low Battery Warning",
      message: "Hawk-2 battery level at 72% - consider return to base",
      timestamp: "14:23:15",
      source: "Hawk-2",
      acknowledged: false,
    },
    {
      id: "alert-2",
      type: "info",
      title: "Mission Update",
      message: "Eagle-1 has reached target altitude for Mission M-001",
      timestamp: "14:20:42",
      source: "Eagle-1",
      acknowledged: false,
    },
    {
      id: "alert-3",
      type: "success",
      title: "System Check Complete",
      message: "All drones passed automated system diagnostics",
      timestamp: "14:15:30",
      source: "System",
      acknowledged: true,
    },
  ])

  // Simulate new alerts
  useEffect(() => {
    const interval = setInterval(() => {
      const alertTypes = ["warning", "info", "success"] as const
      const sources = ["Eagle-1", "Hawk-2", "Falcon-3", "System"]
      const messages = [
        "GPS signal strength improved",
        "Temperature within normal range",
        "Altitude adjustment completed",
        "Communication link established",
        "Battery optimization active",
        "Wind conditions favorable",
      ]

      if (Math.random() > 0.7) {
        const newAlert: Alert = {
          id: `alert-${Date.now()}`,
          type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
          title: "System Notification",
          message: messages[Math.floor(Math.random() * messages.length)],
          timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
          source: sources[Math.floor(Math.random() * sources.length)],
          acknowledged: false,
        }

        setAlerts((prev) => [newAlert, ...prev.slice(0, 9)]) // Keep only 10 most recent
      }
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <AlertTriangle className="h-4 w-4" />
      case "warning":
        return <AlertCircle className="h-4 w-4" />
      case "info":
        return <Info className="h-4 w-4" />
      case "success":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case "critical":
        return "text-chart-4 bg-chart-4/10 border-chart-4/20"
      case "warning":
        return "text-chart-3 bg-chart-3/10 border-chart-3/20"
      case "info":
        return "text-chart-1 bg-chart-1/10 border-chart-1/20"
      case "success":
        return "text-chart-2 bg-chart-2/10 border-chart-2/20"
      default:
        return "text-muted-foreground bg-muted/10 border-muted/20"
    }
  }

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "critical":
        return "bg-chart-4 text-chart-4-foreground"
      case "warning":
        return "bg-chart-3 text-chart-3-foreground"
      case "info":
        return "bg-chart-1 text-chart-1-foreground"
      case "success":
        return "bg-chart-2 text-chart-2-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const acknowledgeAlert = (id: string) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === id ? { ...alert, acknowledged: true } : alert)))
  }

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id))
  }

  const unacknowledgedCount = alerts.filter((alert) => !alert.acknowledged).length

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-chart-3" />
            <span>System Alerts</span>
          </div>
          {unacknowledgedCount > 0 && (
            <Badge variant="outline" className="bg-chart-3 text-chart-3-foreground">
              {unacknowledgedCount} new
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-96 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active alerts</p>
            <p className="text-sm">All systems operating normally</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 border rounded-lg ${getAlertColor(alert.type)} ${alert.acknowledged ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getAlertIcon(alert.type)}
                  <h4 className="font-medium text-sm">{alert.title}</h4>
                  <Badge variant="outline" className={getBadgeColor(alert.type)}>
                    {alert.type}
                  </Badge>
                </div>
                <div className="flex items-center space-x-1">
                  {!alert.acknowledged && (
                    <Button size="sm" variant="ghost" onClick={() => acknowledgeAlert(alert.id)}>
                      <CheckCircle className="h-3 w-3" />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => dismissAlert(alert.id)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <p className="text-sm text-pretty mb-2">{alert.message}</p>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Source: {alert.source}</span>
                <span>{alert.timestamp}</span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
