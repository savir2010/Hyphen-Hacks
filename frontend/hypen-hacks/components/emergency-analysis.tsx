"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, FileText, Download, Calendar, Clock, TrendingUp, CheckCircle, XCircle } from "lucide-react"

interface AnalysisResult {
  analysis: string
  directory: string
  images_analyzed: number
  images_found: number
  success: boolean
  timestamp: string
}

export function EmergencyAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const analyzeDirectory = async () => {
    setIsAnalyzing(true)
    setError(null)
    
    try {
      const response = await fetch('http://10.1.9.34:2134/analyze/directory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          directory_path: "/Users/savirdillikar/aws-hack/drone-testing/frontend/hypen-hacks/public/images/enhanced_scout_20250927_182839"
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setAnalysisResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze directory')
      console.error('Analysis error:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const downloadReport = () => {
    if (!analysisResult) return
    
    const reportContent = `Analysis Report
Generated: ${new Date(analysisResult.timestamp).toLocaleString()}
Directory: ${analysisResult.directory}
Images Analyzed: ${analysisResult.images_analyzed}/${analysisResult.images_found}

${analysisResult.analysis}
`
    
    const blob = new Blob([reportContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `emergency-analysis-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const formatAnalysisText = (text: string) => {
    return text.split('\n').map((line, index) => {
      // Handle bold text with ** markers
      if (line.includes('**')) {
        const parts = line.split(/(\*\*.*?\*\*)/g)
        return (
          <p key={index} className="text-sm text-muted-foreground mb-2">
            {parts.map((part, partIndex) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={partIndex} className="font-semibold text-foreground">
                    {part.replace(/\*\*/g, '')}
                  </strong>
                )
              }
              return part
            })}
          </p>
        )
      } else if (line.startsWith('- ')) {
        return (
          <li key={index} className="ml-4 text-sm text-muted-foreground mb-1">
            {line.substring(2)}
          </li>
        )
      } else if (line.trim() === '') {
        return <br key={index} />
      } else {
        return (
          <p key={index} className="text-sm text-muted-foreground mb-2">
            {line}
          </p>
        )
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Analysis Control */}
      <Card className="emergency-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span>Emergency Response Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Analyze scout mission images for fire detection, smoke presence, and emergency response assessment.
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Target Directory:</span>
              <span className="font-mono text-xs bg-secondary px-2 py-1 rounded">
                enhanced_scout_20250927_172148
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Analysis Endpoint:</span>
              <span className="font-mono text-xs bg-secondary px-2 py-1 rounded">
                10.1.9.34:2134/analyze/directory
              </span>
            </div>
          </div>

          <Separator />

          <Button onClick={analyzeDirectory} disabled={isAnalyzing} className="w-full">
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing Images...
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Analyze Emergency Response
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="emergency-card border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-destructive">
              <XCircle className="h-5 w-5" />
              <span className="font-medium">Analysis Failed</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <Card className="emergency-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-chart-3" />
                <span>Analysis Results</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {analysisResult.images_analyzed}/{analysisResult.images_found} images
                </Badge>
                <Button variant="outline" size="sm" onClick={downloadReport}>
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Analysis Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <span>Status:</span>
                <Badge className={analysisResult.success ? "operational" : "bg-destructive"}>
                  {analysisResult.success ? "Success" : "Failed"}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <span>Images Analyzed:</span>
                <span className="font-medium">{analysisResult.images_analyzed}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <span>Analysis Time:</span>
                <span className="font-medium">
                  {new Date(analysisResult.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>

            <Separator />

            {/* Detailed Analysis */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Emergency Response Report</h3>
              <div className="prose prose-sm max-w-none">
                {formatAnalysisText(analysisResult.analysis)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
