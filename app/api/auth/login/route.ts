import { type NextRequest, NextResponse } from "next/server"
import { createUser, getUserByEmail, getUserByMemberId, getPinByCode, usePin } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { generateMemberId } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    console.log("📝 Registration started...")

    const body = await request.json()
    const { fullName, email, phone, password, sponsorId, uplineId, pin, location, pinMethod, packagePrice } = body

    // Split fullName into firstName and lastName
    const nameParts = fullName.trim().split(" ")
    const firstName = nameParts[0] || ""
    const lastName = nameParts.slice(1).join(" ") || ""

    // Validate required fields
    if (!firstName || !email || !phone || !password || !sponsorId || !uplineId) {
      return NextResponse.json(
        {
          success: false,
          message: "All required fields must be filled",
        },
        { status: 400 },
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid email address",
        },
        { status: 400 },
      )
    }

    // Check if email already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email already registered",
        },
        { status: 400 },
      )
    }

    // Validate sponsor exists
    const sponsor = await getUserByMemberId(sponsorId)
    if (!sponsor) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid sponsor ID",
        },
        { status: 400 },
      )
    }

    // Validate upline exists
    const upline = await getUserByMemberId(uplineId)
    if (!upline) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid upline ID",
        },
        { status: 400 },
      )
    }

    // Generate member ID
    const memberId = generateMemberId()

    // Hash password
    const passwordHash = await hashPassword(password)

    // Validate PIN if using existing PIN method
    let pinRecord = null
    if (pinMethod === "existing") {
      if (!pin) {
        return NextResponse.json(
          {
            success: false,
            message: "Registration PIN is required",
          },
          { status: 400 },
        )
      }

      pinRecord = await getPinByCode(pin)
      if (!pinRecord || pinRecord.status !== "available") {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid or already used PIN",
          },
          { status: 400 },
        )
      }
    }

    // Create user based on PIN method
    let newUser
    if (pinMethod === "existing" && pinRecord) {
      // Mark PIN as used
      await usePin(pin, Number.parseInt(memberId.slice(2)))

      newUser = await createUser({
        memberId,
        firstName,
        lastName,
        email: email.toLowerCase(),
        phone,
        passwordHash,
        sponsorId: sponsor.memberId,
        uplineId: upline.memberId,
        location: location || undefined,
        status: "active",
        role: "user",
        activationDate: new Date().toISOString(),
      })

      console.log("✅ User registered and activated:", newUser.email)
    } else {
      newUser = await createUser({
        memberId,
        firstName,
        lastName,
        email: email.toLowerCase(),
        phone,
        passwordHash,
        sponsorId: sponsor.memberId,
        uplineId: upline.memberId,
        location: location || undefined,
        status: "pending",
        role: "user",
        activationDate: undefined,
      })

      console.log("✅ User registered (pending payment):", newUser.email)
    }

    // Return success with user data
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
        fullName,
      },
    })
  } catch (error) {
    console.error("❌ Registration error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Registration failed. Please try again.",
      },
      { status: 500 },
    )
  }
}
