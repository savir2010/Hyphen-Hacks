"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface User {
  username: string
  role: string
}

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    console.log("[v0] AuthGuard bypassing authentication")

    const defaultUser = {
      id: "bypass-user-1",
      username: "guest",
      role: "observer",
      firstName: "Guest",
      lastName: "User",
      email: "guest@emergency.local",
      badgeNumber: "BYPASS001",
    }

    localStorage.setItem("user", JSON.stringify(defaultUser))
    console.log("[v0] Default user session created")

    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const defaultUser = {
      username: "guest",
      role: "observer",
    }

    console.log("[v0] useAuth providing default user")
    setUser(defaultUser)
  }, [])

  const logout = () => {
    console.log("[v0] User logging out")
    localStorage.removeItem("user")
    setUser(null)
    window.location.href = "/login"
  }

  return { user, logout }
}
