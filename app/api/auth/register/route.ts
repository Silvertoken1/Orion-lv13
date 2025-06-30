import { type NextRequest, NextResponse } from "next/server"
import { createUser, getUserByEmail, getUserByMemberId, getPinByCode, usePin } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { generateMemberId } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fullName, email, phone, password, sponsorId, uplineId, pin, location, pinMethod, packagePrice } = body

    // Split fullName into firstName and lastName
    const nameParts = fullName.trim().split(" ")
    const firstName = nameParts[0] || ""
    const lastName = nameParts.slice(1).join(" ") || ""

    // Validate required fields
    if (!firstName || !email || !phone || !password || !sponsorId || !uplineId) {
      return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    // Validate sponsor exists
    const sponsor = await getUserByMemberId(sponsorId)
    if (!sponsor) {
      return NextResponse.json({ error: "Invalid sponsor ID" }, { status: 400 })
    }

    // Validate upline exists
    const upline = await getUserByMemberId(uplineId)
    if (!upline) {
      return NextResponse.json({ error: "Invalid upline ID" }, { status: 400 })
    }

    // Validate PIN if using existing PIN method
    let pinRecord = null
    if (pinMethod === "existing") {
      if (!pin) {
        return NextResponse.json({ error: "Registration PIN is required" }, { status: 400 })
      }

      pinRecord = await getPinByCode(pin)
      if (!pinRecord || pinRecord.status !== "available") {
        return NextResponse.json({ error: "Invalid or already used PIN" }, { status: 400 })
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Generate member ID
    const memberId = generateMemberId()

    // Mark PIN as used if existing PIN method
    let newUser
    if (pinMethod === "existing" && pinRecord) {
      await usePin(pin, memberId)
      newUser = await createUser({
        memberId,
        firstName,
        lastName,
        email,
        phone,
        passwordHash,
        sponsorId,
        uplineId,
        location: location || undefined,
        status: "active",
        role: "user",
        activationDate: new Date().toISOString(),
      })
    } else {
      newUser = await createUser({
        memberId,
        firstName,
        lastName,
        email,
        phone,
        passwordHash,
        sponsorId,
        uplineId,
        location: location || undefined,
        status: "pending",
        role: "user",
        activationDate: undefined,
      })
    }

    // Return success with user data for payment processing
    return NextResponse.json({
      success: true,
      message:
        pinMethod === "existing"
          ? "Registration successful! You can now login."
          : "Registration successful! Please proceed to payment to receive your PIN.",
      user: {
        id: newUser.id,
        memberId: newUser.memberId,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone,
        status: newUser.status,
        packagePrice: packagePrice || 36000,
        pinMethod,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
