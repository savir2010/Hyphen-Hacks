"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, AlertTriangle, CheckCircle, Info, AlertCircle, Bell } from "lucide-react"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  type: "success" | "warning" | "error" | "info"
  title: string
  message: string
  timestamp: Date
  priority: "low" | "medium" | "high" | "critical"
  dismissible?: boolean
}

export function NotificationBar() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "success",
      title: "System Online",
      message: "All drone systems operational",
      timestamp: new Date(),
      priority: "medium",
      dismissible: true,
    },
    {
      id: "2",
      type: "warning",
      title: "Low Battery Alert",
      message: "Drone Eagle-1 battery at 15%",
      timestamp: new Date(Date.now() - 300000),
      priority: "high",
      dismissible: true,
    },
    {
      id: "3",
      type: "info",
      title: "Mission Update",
      message: "Search pattern Alpha-7 completed",
      timestamp: new Date(Date.now() - 600000),
      priority: "low",
      dismissible: true,
    },
  ])

  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-rotate notifications
  useEffect(() => {
    if (notifications.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % notifications.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [notifications.length])

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    if (currentIndex >= notifications.length - 1) {
      setCurrentIndex(0)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      case "error":
        return <AlertCircle className="h-4 w-4" />
      case "info":
        return <Info className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationStyles = (type: string, priority: string) => {
    const baseStyles = "border-l-4 shadow-lg backdrop-blur-md"

    switch (type) {
      case "success":
        return cn(baseStyles, "bg-green-50/90 border-green-500 text-green-800")
      case "warning":
        return cn(baseStyles, "bg-yellow-50/90 border-yellow-500 text-yellow-800")
      case "error":
        return cn(baseStyles, "bg-red-50/90 border-red-500 text-red-800")
      case "info":
        return cn(baseStyles, "bg-blue-50/90 border-blue-500 text-blue-800")
      default:
        return cn(baseStyles, "bg-stone-50/90 border-stone-500 text-stone-800")
    }
  }

  if (notifications.length === 0) return null

  const currentNotification = notifications[currentIndex]

  return (
    <div className="fixed top-0 left-0 right-0 z-50 lg:left-64">
      <div
        className={cn(
          "mx-4 mt-4 rounded-lg p-4 transition-all duration-500 ease-in-out transform",
          getNotificationStyles(currentNotification.type, currentNotification.priority),
          "animate-in slide-in-from-top-2",
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">{getNotificationIcon(currentNotification.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-semibold truncate">{currentNotification.title}</p>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    currentNotification.priority === "critical" && "bg-red-100 text-red-800 border-red-300",
                    currentNotification.priority === "high" && "bg-orange-100 text-orange-800 border-orange-300",
                    currentNotification.priority === "medium" && "bg-blue-100 text-blue-800 border-blue-300",
                    currentNotification.priority === "low" && "bg-gray-100 text-gray-800 border-gray-300",
                  )}
                >
                  {currentNotification.priority}
                </Badge>
              </div>
              <p className="text-xs opacity-90 mt-1">{currentNotification.message}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {notifications.length > 1 && (
              <div className="flex space-x-1">
                {notifications.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-1.5 w-1.5 rounded-full transition-all duration-300",
                      index === currentIndex ? "bg-current" : "bg-current/30",
                    )}
                  />
                ))}
              </div>
            )}

            {currentNotification.dismissible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissNotification(currentNotification.id)}
                className="h-6 w-6 p-0 hover:bg-current/10"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
