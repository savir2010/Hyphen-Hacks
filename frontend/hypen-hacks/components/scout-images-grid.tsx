"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Maximize2, Download, Eye } from "lucide-react"
import Image from "next/image"

interface ScoutImage {
  filename: string
  path: string
  timestamp: string
  step: number
  description: string
}

export function ScoutImagesGrid() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // Define the scout images from the enhanced_scout_20250927_182839 folder (first 5 images)
  const scoutImages: ScoutImage[] = [
    {
      filename: "enhanced_00_start_center_182903.jpg",
      path: "/images/enhanced_scout_20250927_182839/enhanced_00_start_center_182903.jpg",
      timestamp: "18:29:03",
      step: 0,
      description: "Start Center Position"
    },
    {
      filename: "enhanced_01_end_of_side_1_182920.jpg",
      path: "/images/enhanced_scout_20250927_182839/enhanced_01_end_of_side_1_182920.jpg",
      timestamp: "18:29:20",
      step: 1,
      description: "End of Side 1"
    },
    {
      filename: "enhanced_02_side_1_complete_182931.jpg",
      path: "/images/enhanced_scout_20250927_182839/enhanced_02_side_1_complete_182931.jpg",
      timestamp: "18:29:31",
      step: 2,
      description: "Side 1 Complete"
    },
    {
      filename: "enhanced_03_end_of_side_2_182946.jpg",
      path: "/images/enhanced_scout_20250927_182839/enhanced_03_end_of_side_2_182946.jpg",
      timestamp: "18:29:46",
      step: 3,
      description: "End of Side 2"
    },
    {
      filename: "enhanced_04_side_2_complete_182958.jpg",
      path: "/images/enhanced_scout_20250927_182839/enhanced_04_side_2_complete_182958.jpg",
      timestamp: "18:29:58",
      step: 4,
      description: "Side 2 Complete"
    }
  ]

  const downloadImage = (imagePath: string, filename: string) => {
    const link = document.createElement('a')
    link.href = imagePath
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const openFullscreen = (imagePath: string) => {
    setSelectedImage(imagePath)
  }

  return (
    <div className="space-y-6">
      {/* Mission Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Enhanced Scout Mission</h2>
          <p className="text-muted-foreground">Mission Date: September 27, 2025 - 17:21:48</p>
          <p className="text-sm text-muted-foreground">Total Images: {scoutImages.length}</p>
        </div>
        <Badge variant="outline" className="text-sm">
          Mission Complete
        </Badge>
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {scoutImages.map((image, index) => (
          <Card
            key={image.filename}
            className="emergency-card overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg group"
          >
            <CardContent className="p-0">
              <div className="relative aspect-square bg-black">
                <Image
                  src={image.path}
                  alt={image.description}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                
                {/* Overlay with step number */}
                <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm font-medium">
                  Step {image.step}
                </div>
                
                {/* Timestamp overlay */}
                <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm font-mono">
                  {image.timestamp}
                </div>

                {/* Action buttons overlay */}
                <div className="absolute bottom-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation()
                      openFullscreen(image.path)
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation()
                      downloadImage(image.path, image.filename)
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-medium text-foreground text-sm mb-1">
                  {image.description}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {image.filename}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Fullscreen Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full">
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4 z-10"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </Button>
            <Image
              src={selectedImage}
              alt="Fullscreen view"
              fill
              className="object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  )
}
