"use client"

import { Bone as Drone, Flame, AlertTriangle, Users } from "lucide-react"

export function MapLegend() {
  const legendItems = [
    {
      icon: <Drone className="h-3 w-3" />,
      label: "Drone",
      color: "bg-black",
    },
    {
      icon: <Flame className="h-3 w-3" />,
      label: "Fire",
      color: "bg-red-500",
    },
    {
      icon: <AlertTriangle className="h-3 w-3" />,
      label: "Emergency",
      color: "bg-yellow-500",
    },
    {
      icon: <Users className="h-3 w-3" />,
      label: "Personnel",
      color: "bg-blue-500",
    },
  ]

  return (
    <div className="minimal-card p-3 w-32">
      <h4 className="text-xs font-medium mb-2">Legend</h4>
      <div className="space-y-1">
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center space-x-2 text-xs">
            <div className={`p-1 rounded-full ${item.color} text-white`}>{item.icon}</div>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
