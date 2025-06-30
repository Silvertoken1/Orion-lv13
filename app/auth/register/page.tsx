"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, CreditCard, Users, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get URL parameters
  const urlSponsor = searchParams.get("sponsor")
  const urlUpline = searchParams.get("upline")

  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [registrationMethod, setRegistrationMethod] = useState(urlSponsor && urlUpline ? "referral" : "pin")

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    location: "",
    sponsorId: urlSponsor || "",
    uplineId: urlUpline || "",
    pinCode: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password) {
      toast.error("Please fill in all required fields")
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return false
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long")
      return false
    }

    if (registrationMethod === "pin" && !formData.pinCode) {
      toast.error("Please enter your PIN code")
      return false
    }

    if (registrationMethod === "referral" && (!formData.sponsorId || !formData.uplineId)) {
      toast.error("Please enter both Sponsor ID and Upline ID")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          registrationMethod,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
        router.push("/auth/login?message=Registration successful! Please login.")
      } else {
        toast.error(data.error || "Registration failed")
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast.error("Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Join Bright Orion</CardTitle>
            <CardDescription>Create your account and start earning today</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Registration Method Selection */}
              <Tabs value={registrationMethod} onValueChange={setRegistrationMethod} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="pin" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    PIN Registration
                  </TabsTrigger>
                  <TabsTrigger value="referral" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Referral Registration
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="pin" className="space-y-4 mt-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-blue-900">PIN Registration</h3>
                    </div>
                    <p className="text-sm text-blue-700">
                      Use your activation PIN to register and get instant access to the system.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pinCode">Activation PIN *</Label>
                    <Input
                      id="pinCode"
                      name="pinCode"
                      type="text"
                      placeholder="Enter your PIN code"
                      value={formData.pinCode}
                      onChange={handleInputChange}
                      className="uppercase"
                      required={registrationMethod === "pin"}
                    />
                    <p className="text-xs text-muted-foreground">Enter the PIN code provided to you by the admin</p>
                  </div>
                </TabsContent>

                <TabsContent value="referral" className="space-y-4 mt-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-green-600" />
                      <h3 className="font-semibold text-green-900">Referral Registration</h3>
                    </div>
                    <p className="text-sm text-green-700">
                      Register using sponsor and upline information provided by your referrer.
                    </p>
                  </div>

                  {urlSponsor && urlUpline && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">Pre-filled Information</span>
                      </div>
                      <div className="text-xs text-green-700 space-y-1">
                        <p>
                          Sponsor ID: <Badge variant="secondary">{urlSponsor}</Badge>
                        </p>
                        <p>
                          Upline ID: <Badge variant="secondary">{urlUpline}</Badge>
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sponsorId">Sponsor ID *</Label>
                      <Input
                        id="sponsorId"
                        name="sponsorId"
                        type="text"
                        placeholder="e.g., MASTER001"
                        value={formData.sponsorId}
                        onChange={handleInputChange}
                        className="uppercase"
                        required={registrationMethod === "referral"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="uplineId">Upline ID *</Label>
                      <Input
                        id="uplineId"
                        name="uplineId"
                        type="text"
                        placeholder="e.g., MASTER001"
                        value={formData.uplineId}
                        onChange={handleInputChange}
                        className="uppercase"
                        required={registrationMethod === "referral"}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <Separator />

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-semibold">Personal Information</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+234 800 000 0000"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location (Optional)</Label>
                  <Input
                    id="location"
                    name="location"
                    type="text"
                    placeholder="Lagos, Nigeria"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>

            {/* Help Section */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold text-sm">Need Help?</h4>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Contact admin for PIN codes or referral information</p>
                <p>• Use MASTER001 as default Sponsor/Upline if unsure</p>
                <p>• Ensure all information is accurate before submitting</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
