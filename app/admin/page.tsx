"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, UserX, CreditCard, DollarSign, UserPlus, Settings } from "lucide-react"
import Link from "next/link"

interface AdminStats {
  totalUsers: number
  activeUsers: number
  pendingUsers: number
  availablePins: number
  usedPins: number
  totalEarnings: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your MLM system</p>
        </div>
        <Badge variant="secondary">Administrator</Badge>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">Activated accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Users</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingUsers}</div>
              <p className="text-xs text-muted-foreground">Awaiting activation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available PINs</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.availablePins}</div>
              <p className="text-xs text-muted-foreground">Ready for use</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Used PINs</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.usedPins}</div>
              <p className="text-xs text-muted-foreground">Already activated</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{Number(stats.totalEarnings).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">System-wide earnings</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/admin/referrals">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2 bg-transparent">
                <UserPlus className="h-6 w-6" />
                <span className="text-sm">Referral Management</span>
              </Button>
            </Link>

            <Link href="/admin/users">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2 bg-transparent">
                <Users className="h-6 w-6" />
                <span className="text-sm">Manage Users</span>
              </Button>
            </Link>

            <Link href="/admin/pins">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2 bg-transparent">
                <CreditCard className="h-6 w-6" />
                <span className="text-sm">PIN Management</span>
              </Button>
            </Link>

            <Link href="/admin/stockists">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2 bg-transparent">
                <Settings className="h-6 w-6" />
                <span className="text-sm">Stockist Management</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Master Sponsor ID:</span>
              <Badge variant="secondary">MASTER001</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Package Price:</span>
              <Badge variant="secondary">₦36,000</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Commission Levels:</span>
              <Badge variant="secondary">6 Levels</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">System Status:</span>
              <Badge variant="default" className="bg-green-600">
                Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
