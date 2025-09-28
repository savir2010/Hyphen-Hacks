"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Bone as Drone, AlertTriangle, CheckCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
    role: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get("signup") === "success") {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    setTimeout(() => {
      setIsLoading(false)

      // Create a default user session regardless of input
      const sessionData = {
        id: "temp-user-1",
        username: credentials.username || "guest",
        role: credentials.role || "observer",
        firstName: "Guest",
        lastName: "User",
        email: "guest@emergency.local",
        badgeNumber: "TEMP001",
      }

      localStorage.setItem("user", JSON.stringify(sessionData))
      router.push("/dashboard")
    }, 1000) // Reduced delay for faster access
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Drone className="h-8 w-8 text-primary" />
            </div>
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-balance">First Responder Command</h1>
            <p className="text-muted-foreground text-pretty">Secure access to drone operations center</p>
          </div>
        </div>

        {showSuccess && (
          <div className="flex items-center space-x-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-500">Account created successfully! You can now sign in.</p>
          </div>
        )}

        {/* Emergency Notice */}
        <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">Authorized personnel only. All access is monitored.</p>
        </div>

        {/* Login Form */}
        <Card className="border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>Enter your credentials to access the system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={credentials.username}
                  onChange={(e) => setCredentials((prev) => ({ ...prev, username: e.target.value }))}
                  required
                  className="bg-input border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={credentials.password}
                  onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                  required
                  className="bg-input border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={credentials.role}
                  onValueChange={(value) => setCredentials((prev) => ({ ...prev, role: value }))}
                >
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="commander">Incident Commander</SelectItem>
                    <SelectItem value="pilot">Drone Pilot</SelectItem>
                    <SelectItem value="observer">Observer</SelectItem>
                    <SelectItem value="technician">Technical Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</div>}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !credentials.username || !credentials.password || !credentials.role}
              >
                {isLoading ? "Authenticating..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/signup" className="text-primary hover:underline">
                  Create account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>Emergency Response System v2.1</p>
          <p>For technical support, contact IT Command</p>
        </div>
      </div>
    </div>
  )
}
