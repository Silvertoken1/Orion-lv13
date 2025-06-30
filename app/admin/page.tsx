"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, DollarSign, CreditCard, TrendingUp, Settings, Key, LinkIcon, BarChart3, Shield } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalEarnings: string
  pendingPayments: number
  availablePins: number
  usedPins: number
  totalCommissions: string
  pendingCommissions: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminStats()
  }, [])

  const fetchAdminStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      const data = await response.json()

      if (data.success) {
        setStats(data.data)
      } else {
        toast.error("Failed to load admin statistics")
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error)
      toast.error("Error loading dashboard data")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your MLM system and monitor performance</p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          <Shield className="h-4 w-4 mr-2" />
          Administrator
        </Badge>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">{stats.activeUsers} active users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{stats.totalEarnings}</div>
              <p className="text-xs text-muted-foreground">{stats.pendingPayments} pending payments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">PIN Codes</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.availablePins}</div>
              <p className="text-xs text-muted-foreground">{stats.usedPins} used pins</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commissions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{stats.totalCommissions}</div>
              <p className="text-xs text-muted-foreground">{stats.pendingCommissions} pending</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-blue-600" />
              Referral Management
            </CardTitle>
            <CardDescription>Create referral links and manage user onboarding</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/referrals">
              <Button className="w-full">Manage Referrals</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              User Management
            </CardTitle>
            <CardDescription>View and manage all registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/users">
              <Button className="w-full bg-transparent" variant="outline">
                Manage Users
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-purple-600" />
              PIN Management
            </CardTitle>
            <CardDescription>Generate and manage activation PIN codes</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/pins">
              <Button className="w-full bg-transparent" variant="outline">
                Manage PINs
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-orange-600" />
              Payment Management
            </CardTitle>
            <CardDescription>Monitor payments and transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/payments">
              <Button className="w-full bg-transparent" variant="outline">
                View Payments
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-red-600" />
              Analytics
            </CardTitle>
            <CardDescription>View detailed system analytics and reports</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/analytics">
              <Button className="w-full bg-transparent" variant="outline">
                View Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-600" />
              System Settings
            </CardTitle>
            <CardDescription>Configure system settings and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/settings">
              <Button className="w-full bg-transparent" variant="outline">
                System Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Master Account Information */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <Shield className="h-5 w-5" />
            Master Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="text-amber-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">🎯 For New User Registration:</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Sponsor ID:</strong> <Badge variant="secondary">MASTER001</Badge>
                </p>
                <p>
                  <strong>Upline ID:</strong> <Badge variant="secondary">MASTER001</Badge>
                </p>
                <p>
                  <strong>Master PINs:</strong> MASTER2024, BRIGHT001, ORION123
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">📋 Instructions for Users:</h4>
              <div className="space-y-1 text-sm">
                <p>• Use MASTER001 as both Sponsor and Upline ID</p>
                <p>• Any master PIN code for instant activation</p>
                <p>• Registration will be approved automatically</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
