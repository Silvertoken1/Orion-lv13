"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Copy, Mail, MessageCircle, Users, UserPlus, Link2 } from "lucide-react"
import { toast } from "sonner"

interface User {
  id: number
  memberId: string
  firstName: string
  lastName: string
  email: string
  totalReferrals: number
  status: string
  createdAt: string
}

interface ReferralInfo {
  sponsorId: string
  uplineId: string
  sponsorName: string
  uplineName: string
  registrationUrl: string
  message: string
  createdAt: string
  createdBy: string
}

export default function ReferralsPage() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedSponsor, setSelectedSponsor] = useState("")
  const [selectedUpline, setSelectedUpline] = useState("")
  const [customMessage, setCustomMessage] = useState("")
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchingUsers, setFetchingUsers] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/referral-info")
      if (response.ok) {
        const data = await response.json()
        setUsers(data.data.activeUsers || [])

        // Set default to master account
        if (data.data.masterAccount) {
          setSelectedSponsor(data.data.masterAccount.memberId)
          setSelectedUpline(data.data.masterAccount.memberId)
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Failed to fetch users")
    } finally {
      setFetchingUsers(false)
    }
  }

  const generateReferralInfo = async () => {
    if (!selectedSponsor || !selectedUpline) {
      toast.error("Please select both sponsor and upline")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/admin/create-referral-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sponsorId: selectedSponsor,
          uplineId: selectedUpline,
          customMessage,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setReferralInfo(data.referralInfo)
        toast.success("Referral information generated successfully!")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to generate referral information")
      }
    } catch (error) {
      console.error("Error generating referral info:", error)
      toast.error("Failed to generate referral information")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard!`)
  }

  const shareViaEmail = () => {
    if (!referralInfo) return

    const subject = "Join Bright Orion MLM - Registration Information"
    const body = `Hi there!

You've been invited to join Bright Orion MLM. Here are your registration details:

Sponsor ID: ${referralInfo.sponsorId}
Upline ID: ${referralInfo.uplineId}

Registration Link: ${referralInfo.registrationUrl}

${referralInfo.message}

Best regards,
Bright Orion Team`

    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
  }

  const shareViaWhatsApp = () => {
    if (!referralInfo) return

    const message = `🌟 *Join Bright Orion MLM* 🌟

You've been invited to join our network!

📋 *Registration Details:*
• Sponsor ID: *${referralInfo.sponsorId}*
• Upline ID: *${referralInfo.uplineId}*

🔗 *Direct Registration Link:*
${referralInfo.registrationUrl}

${referralInfo.message}

Join us today and start earning! 💰`

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`)
  }

  if (fetchingUsers) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading users...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Referral Management</h1>
          <p className="text-muted-foreground">Generate referral information for new users</p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          {users.length} Active Users
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Generate Referral Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Generate Referral Information
            </CardTitle>
            <CardDescription>Create sponsor and upline information for new user registration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sponsor">Sponsor</Label>
              <Select value={selectedSponsor} onValueChange={setSelectedSponsor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sponsor" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.memberId}>
                      {user.memberId} - {user.firstName} {user.lastName}
                      <Badge variant="outline" className="ml-2">
                        {user.totalReferrals} refs
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="upline">Upline</Label>
              <Select value={selectedUpline} onValueChange={setSelectedUpline}>
                <SelectTrigger>
                  <SelectValue placeholder="Select upline" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.memberId}>
                      {user.memberId} - {user.firstName} {user.lastName}
                      <Badge variant="outline" className="ml-2">
                        {user.totalReferrals} refs
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Custom Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Add a custom message for the new user..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={generateReferralInfo}
              disabled={loading || !selectedSponsor || !selectedUpline}
              className="w-full"
            >
              {loading ? "Generating..." : "Generate Referral Info"}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Referral Info */}
        {referralInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                Generated Referral Information
              </CardTitle>
              <CardDescription>Share this information with the new user</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">Sponsor ID</Label>
                    <p className="font-mono text-lg">{referralInfo.sponsorId}</p>
                    <p className="text-sm text-muted-foreground">{referralInfo.sponsorName}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(referralInfo.sponsorId, "Sponsor ID")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">Upline ID</Label>
                    <p className="font-mono text-lg">{referralInfo.uplineId}</p>
                    <p className="text-sm text-muted-foreground">{referralInfo.uplineName}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(referralInfo.uplineId, "Upline ID")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Registration Link</Label>
                  <div className="flex items-center gap-2">
                    <Input value={referralInfo.registrationUrl} readOnly className="font-mono text-sm" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(referralInfo.registrationUrl, "Registration Link")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-sm font-medium">Share Options</Label>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={shareViaEmail} className="flex-1 bg-transparent">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                  <Button variant="outline" onClick={shareViaWhatsApp} className="flex-1 bg-transparent">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    copyToClipboard(
                      `Sponsor ID: ${referralInfo.sponsorId}\nUpline ID: ${referralInfo.uplineId}\nRegistration Link: ${referralInfo.registrationUrl}`,
                      "All Information",
                    )
                  }
                  className="w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy All Information
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions for New Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Step 1:</strong> Visit the registration page using the provided link
            </p>
            <p>
              <strong>Step 2:</strong> Choose "Referral Registration" option
            </p>
            <p>
              <strong>Step 3:</strong> Enter the provided Sponsor ID and Upline ID
            </p>
            <p>
              <strong>Step 4:</strong> Complete personal information and submit
            </p>
            <p>
              <strong>Step 5:</strong> Account will be activated immediately for earning
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
