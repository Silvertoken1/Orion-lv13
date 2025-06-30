"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, LinkIcon, Copy, Mail, MessageCircle, CheckCircle, AlertCircle, Crown, ExternalLink } from "lucide-react"
import { toast } from "sonner"

interface User {
  id: number
  memberId: string
  firstName: string
  lastName: string
  email: string
  status: string
  role: string
}

interface ReferralData {
  users: User[]
  masterInfo: {
    sponsorId: string
    uplineId: string
    note: string
  }
}

export default function ReferralManagementPage() {
  const [loading, setLoading] = useState(false)
  const [referralData, setReferralData] = useState<ReferralData | null>(null)
  const [selectedSponsor, setSelectedSponsor] = useState("")
  const [selectedUpline, setSelectedUpline] = useState("")
  const [generatedLink, setGeneratedLink] = useState("")
  const [registrationDetails, setRegistrationDetails] = useState<any>(null)

  useEffect(() => {
    fetchReferralData()
  }, [])

  const fetchReferralData = async () => {
    try {
      const response = await fetch("/api/admin/referral-info")
      const data = await response.json()

      if (data.success) {
        setReferralData(data.data)
        // Set master as default
        setSelectedSponsor(data.data.masterInfo.sponsorId)
        setSelectedUpline(data.data.masterInfo.uplineId)
      } else {
        toast.error("Failed to load referral data")
      }
    } catch (error) {
      toast.error("Error loading referral data")
    }
  }

  const generateReferralLink = async () => {
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
        }),
      })

      const data = await response.json()

      if (data.success) {
        setGeneratedLink(data.data.referralLink)
        setRegistrationDetails(data.data)
        toast.success("Referral link generated successfully!")
      } else {
        toast.error(data.error || "Failed to generate referral link")
      }
    } catch (error) {
      toast.error("Error generating referral link")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard!`)
  }

  const shareViaEmail = () => {
    if (!registrationDetails) return

    const subject = "Join Bright Orion MLM - Registration Information"
    const body = `Hello!

You've been invited to join Bright Orion MLM platform. Here are your registration details:

🎯 REGISTRATION INFORMATION:
• Sponsor ID: ${registrationDetails.sponsorInfo.memberId}
• Upline ID: ${registrationDetails.uplineInfo.memberId}
• Sponsor: ${registrationDetails.sponsorInfo.name}
• Upline: ${registrationDetails.uplineInfo.name}

🚀 QUICK REGISTRATION:
Click this link to register with pre-filled information:
${registrationDetails.referralLink}

📋 MANUAL REGISTRATION:
If the link doesn't work, visit our registration page and use:
• Sponsor ID: ${registrationDetails.sponsorInfo.memberId}
• Upline ID: ${registrationDetails.uplineInfo.memberId}

💡 INSTRUCTIONS:
1. Click the registration link above
2. Fill in your personal information
3. Your sponsor and upline information is already filled
4. Complete registration and start earning!

Welcome to Bright Orion!

Best regards,
Bright Orion Admin Team`

    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoLink)
  }

  const shareViaWhatsApp = () => {
    if (!registrationDetails) return

    const message = `🎉 *Join Bright Orion MLM Platform!*

You've been invited to join our MLM platform. Here are your registration details:

🎯 *REGISTRATION INFO:*
• *Sponsor ID:* ${registrationDetails.sponsorInfo.memberId}
• *Upline ID:* ${registrationDetails.uplineInfo.memberId}
• *Sponsor:* ${registrationDetails.sponsorInfo.name}

🚀 *QUICK REGISTRATION:*
${registrationDetails.referralLink}

💡 *INSTRUCTIONS:*
1. Click the link above
2. Fill your personal details
3. Complete registration
4. Start earning immediately!

Welcome to Bright Orion! 🌟`

    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappLink, "_blank")
  }

  if (!referralData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading referral management...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Users className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Referral Management</h1>
          <p className="text-muted-foreground">Create referral links and manage user onboarding</p>
        </div>
      </div>

      {/* Master Information Alert */}
      <Alert className="border-amber-200 bg-amber-50">
        <Crown className="h-5 w-5 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <div className="space-y-2">
            <p className="font-semibold">🎯 Master Sponsor Information</p>
            <div className="bg-white rounded-lg p-3 border border-amber-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <strong>Master Sponsor ID:</strong>
                  <Badge variant="secondary" className="ml-2">
                    {referralData.masterInfo.sponsorId}
                  </Badge>
                </div>
                <div>
                  <strong>Master Upline ID:</strong>
                  <Badge variant="secondary" className="ml-2">
                    {referralData.masterInfo.uplineId}
                  </Badge>
                </div>
              </div>
              <p className="text-xs mt-2 text-amber-700">{referralData.masterInfo.note}</p>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Referral Link Generator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Generate Referral Link
            </CardTitle>
            <CardDescription>Create personalized registration links for new users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sponsor">Select Sponsor</Label>
              <Select value={selectedSponsor} onValueChange={setSelectedSponsor}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose sponsor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={referralData.masterInfo.sponsorId}>
                    🏆 {referralData.masterInfo.sponsorId} (Master Sponsor)
                  </SelectItem>
                  {referralData.users.map((user) => (
                    <SelectItem key={user.id} value={user.memberId}>
                      {user.memberId} - {user.firstName} {user.lastName}
                      {user.role === "admin" && " (Admin)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="upline">Select Upline</Label>
              <Select value={selectedUpline} onValueChange={setSelectedUpline}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose upline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={referralData.masterInfo.uplineId}>
                    🏆 {referralData.masterInfo.uplineId} (Master Upline)
                  </SelectItem>
                  {referralData.users.map((user) => (
                    <SelectItem key={user.id} value={user.memberId}>
                      {user.memberId} - {user.firstName} {user.lastName}
                      {user.role === "admin" && " (Admin)"}
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

        {/* Generated Link Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Generated Referral Information
            </CardTitle>
            <CardDescription>Share this information with new users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedLink ? (
              <>
                <div className="space-y-2">
                  <Label>Registration Link</Label>
                  <div className="flex gap-2">
                    <Input value={generatedLink} readOnly className="font-mono text-xs" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(generatedLink, "Registration link")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => window.open(generatedLink, "_blank")}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {registrationDetails && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-xs text-muted-foreground">SPONSOR INFO</Label>
                        <div className="mt-1">
                          <p className="font-semibold">{registrationDetails.sponsorInfo.memberId}</p>
                          <p className="text-muted-foreground">{registrationDetails.sponsorInfo.name}</p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">UPLINE INFO</Label>
                        <div className="mt-1">
                          <p className="font-semibold">{registrationDetails.uplineInfo.memberId}</p>
                          <p className="text-muted-foreground">{registrationDetails.uplineInfo.name}</p>
                        </div>
                      </div>
                    </div>

                    <Separator />
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={shareViaEmail} className="flex-1 bg-transparent">
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </Button>
                      <Button size="sm" variant="outline" onClick={shareViaWhatsApp} className="flex-1 bg-transparent">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        WhatsApp
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          copyToClipboard(
                            `Sponsor ID: ${registrationDetails.sponsorInfo.memberId}\nUpline ID: ${registrationDetails.uplineInfo.memberId}\nLink: ${generatedLink}`,
                            "All details",
                          )
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Generate a referral link to see the details here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle>📋 How to Use Referral Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">🎯 For Quick Registration:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Use MASTER001 as both Sponsor and Upline ID</li>
                <li>• Generate the referral link</li>
                <li>• Share the link with new users</li>
                <li>• Users register instantly with pre-filled information</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">📤 Sharing Options:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Email: Sends formatted registration details</li>
                <li>• WhatsApp: Shares mobile-friendly message</li>
                <li>• Copy: Copies all details to clipboard</li>
                <li>• Direct Link: Opens registration page</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
