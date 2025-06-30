"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Mail, MessageCircle, Users, LinkIcon } from "lucide-react"
import { toast } from "sonner"

interface User {
  id: string
  memberId: string
  firstName: string
  lastName: string
  email: string
  status: string
}

export default function AdminReferralsPage() {
  const [users, setUsers] = useState<User[]>([])
  const [sponsorId, setSponsorId] = useState("")
  const [uplineId, setUplineId] = useState("")
  const [referralLink, setReferralLink] = useState("")
  const [loading, setLoading] = useState(false)
  const [sponsor, setSponsor] = useState<User | null>(null)
  const [upline, setUpline] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/referral-info")
      const data = await response.json()
      if (data.success) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Failed to load users")
    }
  }

  const generateReferralLink = async () => {
    if (!sponsorId || !uplineId) {
      toast.error("Please select both sponsor and upline")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/admin/create-referral-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sponsorId, uplineId }),
      })

      const data = await response.json()
      if (data.success) {
        setReferralLink(data.referralLink)
        setSponsor(data.sponsor)
        setUpline(data.upline)
        toast.success("Referral link generated successfully!")
      } else {
        toast.error(data.error || "Failed to generate referral link")
      }
    } catch (error) {
      console.error("Error generating referral link:", error)
      toast.error("Failed to generate referral link")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
  }

  const shareViaEmail = () => {
    const subject = "Join Bright Orion MLM Platform"
    const body = `Hi there!

You've been invited to join the Bright Orion MLM Platform.

Your registration details:
- Sponsor: ${sponsor?.firstName} ${sponsor?.lastName} (${sponsor?.memberId})
- Upline: ${upline?.firstName} ${upline?.lastName} (${upline?.memberId})

Click here to register: ${referralLink}

Best regards,
Bright Orion Team`

    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoLink)
  }

  const shareViaWhatsApp = () => {
    const message = `🎉 Join Bright Orion MLM Platform!

Your registration details:
👤 Sponsor: ${sponsor?.firstName} ${sponsor?.lastName} (${sponsor?.memberId})
👤 Upline: ${upline?.firstName} ${upline?.lastName} (${upline?.memberId})

🔗 Register here: ${referralLink}

Welcome to the team! 🚀`

    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappLink, "_blank")
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Users className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Referral Management</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Generate Referral Link */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Generate Referral Link
            </CardTitle>
            <CardDescription>Create a referral link for new users with specific sponsor and upline</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sponsor">Select Sponsor</Label>
              <Select value={sponsorId} onValueChange={setSponsorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose sponsor..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.memberId}>
                      {user.firstName} {user.lastName} ({user.memberId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="upline">Select Upline</Label>
              <Select value={uplineId} onValueChange={setUplineId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose upline..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.memberId}>
                      {user.firstName} {user.lastName} ({user.memberId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={generateReferralLink} disabled={loading} className="w-full">
              {loading ? "Generating..." : "Generate Referral Link"}
            </Button>
          </CardContent>
        </Card>

        {/* Quick Setup */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Setup</CardTitle>
            <CardDescription>Use default master account for new registrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900">Master Account Details</h3>
              <div className="mt-2 space-y-1 text-sm text-blue-800">
                <p>
                  <strong>Sponsor ID:</strong> MASTER001
                </p>
                <p>
                  <strong>Upline ID:</strong> MASTER001
                </p>
                <p>
                  <strong>Master PINs:</strong> MASTER2024, BRIGHT001, ORION123
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                setSponsorId("MASTER001")
                setUplineId("MASTER001")
              }}
              variant="outline"
              className="w-full"
            >
              Use Master Account
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Generated Link Section */}
      {referralLink && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Referral Information</CardTitle>
            <CardDescription>Share this information with new users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Registration Details */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-900">Sponsor Information</h3>
                <p className="text-sm text-green-800">
                  {sponsor?.firstName} {sponsor?.lastName} ({sponsor?.memberId})
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900">Upline Information</h3>
                <p className="text-sm text-blue-800">
                  {upline?.firstName} {upline?.lastName} ({upline?.memberId})
                </p>
              </div>
            </div>

            {/* Referral Link */}
            <div className="space-y-2">
              <Label>Referral Link</Label>
              <div className="flex gap-2">
                <Input value={referralLink} readOnly className="flex-1" />
                <Button size="icon" variant="outline" onClick={() => copyToClipboard(referralLink)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Registration Instructions */}
            <div className="space-y-2">
              <Label>Registration Instructions</Label>
              <Textarea
                readOnly
                value={`To register on Bright Orion MLM Platform:

1. Visit: ${referralLink}
2. Or manually enter:
   - Sponsor ID: ${sponsor?.memberId}
   - Upline ID: ${upline?.memberId}
3. Fill in your personal information
4. Complete registration

Your account will be activated immediately!`}
                rows={8}
              />
            </div>

            {/* Share Options */}
            <div className="flex gap-2">
              <Button onClick={shareViaEmail} className="flex-1">
                <Mail className="h-4 w-4 mr-2" />
                Share via Email
              </Button>
              <Button onClick={shareViaWhatsApp} variant="outline" className="flex-1 bg-transparent">
                <MessageCircle className="h-4 w-4 mr-2" />
                Share via WhatsApp
              </Button>
              <Button
                onClick={() =>
                  copyToClipboard(
                    `Sponsor ID: ${sponsor?.memberId}\nUpline ID: ${upline?.memberId}\nLink: ${referralLink}`,
                  )
                }
                variant="outline"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
