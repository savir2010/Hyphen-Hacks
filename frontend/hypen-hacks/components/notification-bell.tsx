"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, X, AlertTriangle, CheckCircle, Info, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  type: "success" | "warning" | "error" | "info"
  title: string
  message: string
  timestamp: Date
  priority: "low" | "medium" | "high" | "critical"
  read: boolean
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "success",
      title: "System Online",
      message: "All drone systems operational",
      timestamp: new Date(),
      priority: "medium",
      read: false,
    },
    {
      id: "2",
      type: "warning",
      title: "Low Battery Alert",
      message: "Drone Eagle-1 battery at 15%",
      timestamp: new Date(Date.now() - 300000),
      priority: "high",
      read: false,
    },
    {
      id: "3",
      type: "info",
      title: "Mission Update",
      message: "Search pattern Alpha-7 completed",
      timestamp: new Date(Date.now() - 600000),
      priority: "low",
      read: true,
    },
  ])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case "info":
        return <Info className="h-4 w-4 text-blue-600" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="relative p-2 hover:bg-gray-100">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 text-white">{unreadCount}</Badge>
        )}
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 z-50 minimal-card rounded-lg shadow-lg">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-sm">Notifications</h3>
              {unreadCount > 0 && <p className="text-xs text-gray-500">{unreadCount} unread</p>}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">No notifications</div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer",
                      !notification.read && "bg-gray-50",
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium truncate">{notification.title}</p>
                            {!notification.read && <div className="h-2 w-2 bg-blue-500 rounded-full" />}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{notification.timestamp.toLocaleTimeString()}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          dismissNotification(notification.id)
                        }}
                        className="h-6 w-6 p-0 hover:bg-gray-200"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
