"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, DollarSign, TrendingUp, Activity, UserPlus, LinkIcon, Settings, BarChart3 } from "lucide-react"
import Link from "next/link"

interface AdminStats {
  totalUsers: number
  activeUsers: number
  pendingUsers: number
  totalEarnings: string
  totalCommissions: string
  availablePins: number
  usedPins: number
  recentPayments: number
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
      const data = await response.json()
      if (data.success) {
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
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Badge variant="secondary">Administrator</Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeUsers || 0} active, {stats?.pendingUsers || 0} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{stats?.totalEarnings || "0.00"}</div>
            <p className="text-xs text-muted-foreground">₦{stats?.totalCommissions || "0.00"} in commissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activation PINs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.availablePins || 0}</div>
            <p className="text-xs text-muted-foreground">{stats?.usedPins || 0} used pins</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.recentPayments || 0}</div>
            <p className="text-xs text-muted-foreground">Payments this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>Manage users, approve registrations, and view user details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/admin/users">
                <Button className="w-full">Manage Users</Button>
              </Link>
              <div className="text-sm text-muted-foreground">{stats?.totalUsers || 0} total users registered</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Referral Management
            </CardTitle>
            <CardDescription>Create referral links and manage sponsor relationships</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/admin/referrals">
                <Button className="w-full">Manage Referrals</Button>
              </Link>
              <div className="text-sm text-muted-foreground">Generate links for new users</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              PIN Management
            </CardTitle>
            <CardDescription>Generate and manage activation PINs for user registration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/admin/pins">
                <Button className="w-full">Manage PINs</Button>
              </Link>
              <div className="text-sm text-muted-foreground">{stats?.availablePins || 0} PINs available</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Stockist Management
            </CardTitle>
            <CardDescription>Manage stockists, inventory, and stock requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/admin/stockists">
                <Button className="w-full">Manage Stockists</Button>
              </Link>
              <div className="text-sm text-muted-foreground">View stockist applications</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Commission Management
            </CardTitle>
            <CardDescription>Review and approve commission payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full" disabled>
                Coming Soon
              </Button>
              <div className="text-sm text-muted-foreground">₦{stats?.totalCommissions || "0.00"} pending</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Settings
            </CardTitle>
            <CardDescription>Configure system settings and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full bg-transparent" variant="outline" disabled>
                Settings
              </Button>
              <div className="text-sm text-muted-foreground">System configuration</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Master Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Master Account Information</CardTitle>
          <CardDescription>Default sponsor and upline information for new registrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900">Master Sponsor</h3>
              <p className="text-sm text-blue-800">ID: MASTER001</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900">Master Upline</h3>
              <p className="text-sm text-green-800">ID: MASTER001</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-900">Master PINs</h3>
              <p className="text-sm text-purple-800">MASTER2024, BRIGHT001, ORION123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
