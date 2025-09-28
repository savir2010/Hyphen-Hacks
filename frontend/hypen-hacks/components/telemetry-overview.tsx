"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Zap, Thermometer, Wind } from "lucide-react"

export function TelemetryOverview() {
  const metrics = [
    {
      title: "System Health",
      value: "98.5%",
      change: "+0.2% from last hour",
      icon: Activity,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
      status: "optimal",
    },
    {
      title: "Power Consumption",
      value: "2.4kW",
      change: "Normal range",
      icon: Zap,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
      status: "normal",
    },
    {
      title: "Avg Temperature",
      value: "42°C",
      change: "Within limits",
      icon: Thermometer,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
      status: "normal",
    },
    {
      title: "Wind Conditions",
      value: "12 mph",
      change: "Favorable",
      icon: Wind,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
      status: "good",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "optimal":
        return <Badge className="bg-chart-2 text-chart-2-foreground">Optimal</Badge>
      case "normal":
        return <Badge variant="outline">Normal</Badge>
      case "good":
        return <Badge className="bg-chart-2 text-chart-2-foreground">Good</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.title} className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
            <div className={`p-2 rounded-lg ${metric.bgColor}`}>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{metric.value}</div>
              {getStatusBadge(metric.status)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{metric.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
