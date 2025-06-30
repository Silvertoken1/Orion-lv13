"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, UserPlus, Key, Crown, CheckCircle } from "lucide-react"

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [registrationMethod, setRegistrationMethod] = useState("referral")
  const router = useRouter()
  const searchParams = useSearchParams()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    location: "",
    sponsorId: "MASTER001",
    uplineId: "MASTER001",
    pinCode: "",
  })

  // Pre-fill form from URL parameters
  useEffect(() => {
    const sponsor = searchParams.get("sponsor")
    const upline = searchParams.get("upline")

    if (sponsor || upline) {
      setFormData((prev) => ({
        ...prev,
        sponsorId: sponsor || "MASTER001",
        uplineId: upline || "MASTER001",
      }))
      setRegistrationMethod("referral")
    }
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

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
        setSuccess("🎉 Registration successful! You can now login with your credentials.")
        setTimeout(() => {
          router.push("/auth/login")
        }, 3000)
      } else {
        setError(data.error || "Registration failed")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <span className="text-white font-bold text-3xl">BO</span>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">Join Bright Orion</CardTitle>
          <CardDescription className="text-lg">
            Create your account to start earning with our MLM platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Master Information Alert */}
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <Crown className="h-5 w-5 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <div className="space-y-3">
                <p className="font-semibold text-lg">🎯 Ready to Join? Use These Details!</p>
                <div className="bg-white rounded-lg p-4 border border-amber-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <strong>✅ Sponsor ID:</strong>
                        <span className="font-mono bg-green-100 px-2 py-1 rounded text-green-800">MASTER001</span>
                      </div>
                      <div className="flex justify-between">
                        <strong>✅ Upline ID:</strong>
                        <span className="font-mono bg-green-100 px-2 py-1 rounded text-green-800">MASTER001</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <strong>🔑 Available Master PINs:</strong>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {["MASTER2024", "BRIGHT001", "ORION123", "ADMIN999", "TEST1234"].map((pin) => (
                          <span key={pin} className="font-mono bg-blue-100 px-2 py-1 rounded text-blue-800 text-xs">
                            {pin}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm">
                  💡 <strong>Quick Start:</strong> Use MASTER001 for both IDs and any PIN above for instant activation!
                </p>
              </div>
            </AlertDescription>
          </Alert>

          <Tabs value={registrationMethod} onValueChange={setRegistrationMethod} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="referral" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Referral Registration (Recommended)
              </TabsTrigger>
              <TabsTrigger value="pin" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                PIN Code Registration
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <AlertDescription className="text-green-800 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                {success}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  placeholder="Enter your first name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  placeholder="Enter your last name"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder="Enter your email address"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder="+234..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder="City, State"
                className="mt-1"
              />
            </div>

            <TabsContent value="referral" className="mt-0 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-3">✅ Referral Registration (Recommended)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sponsorId">Sponsor ID *</Label>
                    <Input
                      id="sponsorId"
                      name="sponsorId"
                      type="text"
                      required={registrationMethod === "referral"}
                      value={formData.sponsorId}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      placeholder="MASTER001"
                      className="mt-1 bg-white"
                    />
                    <p className="text-xs text-green-600 mt-1">✅ Pre-filled with MASTER001</p>
                  </div>
                  <div>
                    <Label htmlFor="uplineId">Upline ID *</Label>
                    <Input
                      id="uplineId"
                      name="uplineId"
                      type="text"
                      required={registrationMethod === "referral"}
                      value={formData.uplineId}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      placeholder="MASTER001"
                      className="mt-1 bg-white"
                    />
                    <p className="text-xs text-green-600 mt-1">✅ Pre-filled with MASTER001</p>
                  </div>
                </div>
                <p className="text-sm text-green-700 mt-3">
                  💡 <strong>Perfect!</strong> You're all set with the master sponsor. Just fill in your personal
                  details above and register!
                </p>
              </div>
            </TabsContent>

            <TabsContent value="pin" className="mt-0">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3">🔑 PIN Code Registration</h4>
                <div>
                  <Label htmlFor="pinCode">Activation PIN Code *</Label>
                  <Input
                    id="pinCode"
                    name="pinCode"
                    type="text"
                    required={registrationMethod === "pin"}
                    value={formData.pinCode}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="Enter your PIN code (e.g., MASTER2024)"
                    className="mt-1 bg-white"
                  />
                  <p className="text-xs text-blue-600 mt-1">
                    💡 Use any of the master PINs: MASTER2024, BRIGHT001, ORION123, ADMIN999, TEST1234
                  </p>
                </div>
              </div>
            </TabsContent>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  minLength={6}
                  placeholder="Create a strong password"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  minLength={6}
                  placeholder="Confirm your password"
                  className="mt-1"
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-[#0066E0] hover:bg-[#00266C] h-12 text-lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Your Account...
                </>
              ) : (
                "🚀 Create Account - Join Bright Orion"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in here
              </Link>
            </p>
          </div>

          {/* Help Section */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-semibold text-gray-800 mb-2">🆘 Need Help Getting Started?</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                • <strong>Don't have Sponsor/Upline IDs?</strong> Contact admin to get your referral information
              </p>
              <p>
                • <strong>Want to use PIN?</strong> Ask admin for an activation PIN code
              </p>
              <p>
                • <strong>Quick Start:</strong> Use MASTER001 for both Sponsor and Upline IDs
              </p>
              <p>
                • <strong>Questions?</strong> Contact support at admin@brightorion.com
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
