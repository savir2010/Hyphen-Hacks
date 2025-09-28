"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileText, Download, Calendar, Clock, TrendingUp } from "lucide-react"

export function TelemetryReports() {
  const [isGenerating, setIsGenerating] = useState(false)

  const generateReport = async () => {
    setIsGenerating(true)
    console.log("[v0] Generating telemetry report...")

    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false)
      console.log("[v0] Report generated successfully")
      alert(
        "Telemetry report generated! This would normally download a PDF with comprehensive flight data, performance metrics, and analysis.",
      )
    }, 2000)
  }

  const recentReports = [
    {
      id: "RPT-001",
      title: "Flight Mission M-001",
      date: "2024-01-15",
      duration: "2h 15m",
      status: "completed",
      size: "2.4 MB",
    },
    {
      id: "RPT-002",
      title: "Weekly Performance",
      date: "2024-01-14",
      duration: "7 days",
      status: "completed",
      size: "5.1 MB",
    },
    {
      id: "RPT-003",
      title: "Emergency Response",
      date: "2024-01-13",
      duration: "45m",
      status: "completed",
      size: "1.8 MB",
    },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Generate Report Section */}
      <Card className="emergency-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Generate Report</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Generate comprehensive telemetry reports with flight data, performance metrics, and analysis.
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Current Session:</span>
              <span className="font-medium">2h 31m</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Data Points:</span>
              <span className="font-medium">4,627</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Flight Distance:</span>
              <span className="font-medium">12.4 km</span>
            </div>
          </div>

          <Separator />

          <Button onClick={generateReport} disabled={isGenerating} className="w-full">
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card className="emergency-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Recent Reports</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {recentReports.length} reports
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentReports.map((report, index) => (
            <div key={report.id}>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-foreground truncate">{report.title}</h4>
                    <Badge variant="outline" className="text-xs operational">
                      {report.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{report.date}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{report.duration}</span>
                    </div>
                    <span>{report.size}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="ml-2">
                  <Download className="h-3 w-3" />
                </Button>
              </div>
              {index < recentReports.length - 1 && <Separator className="mt-3" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="emergency-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Quick Stats</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="text-center p-3 bg-secondary/50 rounded-lg">
              <div className="text-lg font-bold text-foreground">87%</div>
              <div className="text-xs text-muted-foreground">Avg Battery</div>
            </div>
            <div className="text-center p-3 bg-secondary/50 rounded-lg">
              <div className="text-lg font-bold text-foreground">95%</div>
              <div className="text-xs text-muted-foreground">Signal Quality</div>
            </div>
            <div className="text-center p-3 bg-secondary/50 rounded-lg">
              <div className="text-lg font-bold text-foreground">150ft</div>
              <div className="text-xs text-muted-foreground">Avg Altitude</div>
            </div>
            <div className="text-center p-3 bg-secondary/50 rounded-lg">
              <div className="text-lg font-bold text-foreground">25mph</div>
              <div className="text-xs text-muted-foreground">Avg Speed</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
