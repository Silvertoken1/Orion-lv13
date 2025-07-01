"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Mail, MessageCircle, Users, LinkIcon, Crown } from "lucide-react"
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
  const [sponsorId, setSponsorId] = useState("MASTER001")
  const [uplineId, setUplineId] = useState("MASTER001")
  const [referralLink, setReferralLink] = useState("")
  const [loading, setLoading] = useState(false)
  const [sponsor, setSponsor] = useState<any>(null)
  const [upline, setUpline] = useState<any>(null)

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
                  <SelectItem value="MASTER001">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-yellow-600" />
                      MASTER001 (Master Sponsor)
                    </div>
                  </SelectItem>
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
                  <SelectItem value="MASTER001">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-yellow-600" />
                      MASTER001 (Master Upline)
                    </div>
                  </SelectItem>
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
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              Master Account Setup
            </CardTitle>
            <CardDescription>Use default master account for new registrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">Master Account Details</h3>
              <div className="space-y-2 text-sm text-yellow-800">
                <div className="flex justify-between">
                  <span className="font-medium">Sponsor ID:</span>
                  <code className="bg-yellow-100 px-2 py-1 rounded">MASTER001</code>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Upline ID:</span>
                  <code className="bg-yellow-100 px-2 py-1 rounded">MASTER001</code>
                </div>
                <div className="mt-3 pt-2 border-t border-yellow-300">
                  <span className="font-medium">Master PINs:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {["MASTER2024", "BRIGHT001", "ORION123", "ADMIN999", "TEST1234"].map((pin) => (
                      <code key={pin} className="bg-yellow-100 px-2 py-1 rounded text-xs">
                        {pin}
                      </code>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <Button
              onClick={() => {
                setSponsorId("MASTER001")
                setUplineId("MASTER001")
                toast.success("Master account selected")
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
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-1">Sponsor Information</h3>
                <p className="text-sm text-green-800">
                  {sponsor?.firstName} {sponsor?.lastName}
                </p>
                <code className="text-xs bg-green-100 px-2 py-1 rounded">{sponsor?.memberId}</code>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-1">Upline Information</h3>
                <p className="text-sm text-blue-800">
                  {upline?.firstName} {upline?.lastName}
                </p>
                <code className="text-xs bg-blue-100 px-2 py-1 rounded">{upline?.memberId}</code>
              </div>
            </div>

            {/* Referral Link */}
            <div className="space-y-2">
              <Label>Referral Link</Label>
              <div className="flex gap-2">
                <Input value={referralLink} readOnly className="flex-1 font-mono text-sm" />
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
                value={`🎯 REGISTRATION INSTRUCTIONS:

1. Click the referral link above to register automatically
2. Or visit /auth/register and manually enter:
   • Sponsor ID: ${sponsor?.memberId}
   • Upline ID: ${upline?.memberId}

3. Fill in your personal information:
   • First Name & Last Name
   • Email Address
   • Phone Number
   • Password

4. Complete registration and your account will be activated immediately!

💡 TIP: Using the referral link automatically fills in the sponsor and upline information.`}
                rows={12}
                className="font-mono text-sm"
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

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle>📋 How New Users Register</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-3 text-green-700">✅ With Referral Link (Recommended)</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Click the generated referral link</li>
                <li>• Sponsor and upline are automatically filled</li>
                <li>• Fill personal information only</li>
                <li>• Submit and account is activated instantly</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-blue-700">📝 Manual Registration</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Visit /auth/register</li>
                <li>• Choose "Referral Registration"</li>
                <li>• Enter provided Sponsor ID and Upline ID</li>
                <li>• Complete personal information</li>
                <li>• Submit for instant activation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
