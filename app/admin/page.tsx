"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatCurrency, formatDate } from "@/lib/utils"
import {
  Users,
  UserCheck,
  UserX,
  Key,
  DollarSign,
  LogOut,
  Plus,
  RefreshCw,
  Crown,
  Shield,
  UserPlus,
  LinkIcon,
} from "lucide-react"
import Link from "next/link"

interface AdminStats {
  totalUsers: number
  activeUsers: number
  pendingUsers: number
  availablePins: number
  usedPins: number
  totalEarnings: string
}

interface User {
  id: number
  memberId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  location: string | null
  sponsorId: string | null
  uplineId: string | null
  status: string
  role: string
  activationDate: string | null
  totalEarnings: string
  availableBalance: string
  totalReferrals: number
  createdAt: string
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [pinCount, setPinCount] = useState(10)
  const [generatingPins, setGeneratingPins] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchStats()
    fetchUsers()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
      } else {
        router.push("/auth/login")
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
      router.push("/auth/login")
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      const data = await response.json()

      if (data.success) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  const generatePins = async () => {
    setGeneratingPins(true)
    setMessage("")

    try {
      const response = await fetch("/api/admin/generate-pins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ count: pinCount }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage(`Successfully generated ${pinCount} new PINs!`)
        fetchStats() // Refresh stats
      } else {
        setMessage(data.error || "Failed to generate PINs")
      }
    } catch (error) {
      setMessage("Network error. Please try again.")
    } finally {
      setGeneratingPins(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/auth/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const refreshData = () => {
    setLoading(true)
    fetchStats()
    fetchUsers()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="text-white font-bold text-2xl">BO</span>
          </div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">BO</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span>Admin Dashboard</span>
                </h1>
                <p className="text-sm text-gray-500">Bright Orion MLM System Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={refreshData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">Referral Management</h3>
                  <p className="text-sm text-blue-700">Create sponsor/upline info for new users</p>
                </div>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/admin/referrals">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Manage Referrals
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-green-900">PIN Management</h3>
                  <p className="text-sm text-green-700">Generate activation PINs for users</p>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-100 bg-transparent"
                >
                  <Link href="/admin/pins">
                    <Key className="h-4 w-4 mr-2" />
                    Manage PINs
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                <UserCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
                <p className="text-xs text-muted-foreground">Activated accounts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Users</CardTitle>
                <UserX className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.pendingUsers}</div>
                <p className="text-xs text-muted-foreground">Awaiting activation</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available PINs</CardTitle>
                <Key className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.availablePins}</div>
                <p className="text-xs text-muted-foreground">Ready for use</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Used PINs</CardTitle>
                <Key className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">{stats.usedPins}</div>
                <p className="text-xs text-muted-foreground">Already activated</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalEarnings)}</div>
                <p className="text-xs text-muted-foreground">System-wide earnings</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* PIN Generation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Generate PINs</span>
              </CardTitle>
              <CardDescription>Create new activation PIN codes for user registration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="pinCount">Number of PINs to generate</Label>
                <Input
                  id="pinCount"
                  type="number"
                  min="1"
                  max="100"
                  value={pinCount}
                  onChange={(e) => setPinCount(Number.parseInt(e.target.value))}
                  className="mt-1"
                />
              </div>

              <Button onClick={generatePins} disabled={generatingPins} className="w-full">
                {generatingPins ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Generate {pinCount} PINs
                  </>
                )}
              </Button>

              {message && (
                <Alert
                  className={
                    message.includes("Successfully") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                  }
                >
                  <AlertDescription className={message.includes("Successfully") ? "text-green-800" : "text-red-800"}>
                    {message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Master Account Info */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                <span>Master Account Information</span>
              </CardTitle>
              <CardDescription>Primary sponsor account for new user registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-3">🎯 Master Sponsor Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-yellow-700">Member ID:</span>
                        <code className="bg-yellow-100 px-2 py-1 rounded text-yellow-800 font-mono">MASTER001</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-yellow-700">Email:</span>
                        <span className="text-yellow-800">master@brightorion.com</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-yellow-700">Password:</span>
                        <code className="bg-yellow-100 px-2 py-1 rounded text-yellow-800 font-mono">master123</code>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-3">📋 For New Users</h4>
                    <div className="space-y-2 text-sm text-yellow-700">
                      <p>
                        • Use <strong>MASTER001</strong> as Sponsor ID
                      </p>
                      <p>
                        • Use <strong>MASTER001</strong> as Upline ID
                      </p>
                      <p>• Master PINs: MASTER2024, BRIGHT001, ORION123</p>
                      <p>• All registrations will be under master network</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-yellow-200">
                  <Button asChild className="w-full bg-yellow-600 hover:bg-yellow-700">
                    <Link href="/admin/referrals">
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Create Referral Information for New Users
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest registered users in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Member ID</th>
                    <th className="text-left py-2">Name</th>
                    <th className="text-left py-2">Email</th>
                    <th className="text-left py-2">Sponsor</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Earnings</th>
                    <th className="text-left py-2">Referrals</th>
                    <th className="text-left py-2">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.slice(0, 10).map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">{user.memberId}</code>
                      </td>
                      <td className="py-2">
                        {user.firstName} {user.lastName}
                        {user.role === "admin" && <Crown className="inline h-3 w-3 ml-1 text-yellow-600" />}
                      </td>
                      <td className="py-2 text-gray-600">{user.email}</td>
                      <td className="py-2">
                        {user.sponsorId ? (
                          <code className="bg-blue-100 px-2 py-1 rounded text-xs font-mono text-blue-800">
                            {user.sponsorId}
                          </code>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-2">
                        <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                      </td>
                      <td className="py-2 font-mono text-green-600">{formatCurrency(user.totalEarnings)}</td>
                      <td className="py-2 text-center">{user.totalReferrals}</td>
                      <td className="py-2 text-gray-500">{formatDate(user.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {users.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No users found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
