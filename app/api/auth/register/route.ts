import { type NextRequest, NextResponse } from "next/server"
import { db, users, activationPins } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { generateMemberId } from "@/lib/utils"
import { eq, and } from "drizzle-orm"

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
    const existingUser = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1)
    if (existingUser.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Email address is already registered",
        },
        { status: 400 },
      )
    }

    // Validate sponsor exists
    const sponsor = await db.select().from(users).where(eq(users.memberId, sponsorId.toUpperCase())).limit(1)
    if (sponsor.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid sponsor ID. Please check and try again.",
        },
        { status: 400 },
      )
    }

    // Validate upline exists
    const upline = await db.select().from(users).where(eq(users.memberId, uplineId.toUpperCase())).limit(1)
    if (upline.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid upline ID. Please check and try again.",
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

      const pinResult = await db
        .select()
        .from(activationPins)
        .where(and(eq(activationPins.pinCode, pin.toUpperCase()), eq(activationPins.status, "available")))
        .limit(1)

      if (pinResult.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid or already used PIN. Please check and try again.",
          },
          { status: 400 },
        )
      }
      pinRecord = pinResult[0]
    }

    // Create user based on PIN method
    let newUser
    if (pinMethod === "existing" && pinRecord) {
      // Mark PIN as used first
      await db
        .update(activationPins)
        .set({
          status: "used",
          usedAt: new Date(),
        })
        .where(eq(activationPins.id, pinRecord.id))

      // Create active user
      const userResult = await db
        .insert(users)
        .values({
          memberId,
          firstName,
          lastName,
          email: email.toLowerCase(),
          phone,
          passwordHash,
          sponsorId: sponsor[0].memberId,
          uplineId: upline[0].memberId,
          location: location || null,
          status: "active",
          role: "user",
          activationDate: new Date(),
        })
        .returning()

      newUser = userResult[0]

      // Update PIN with user ID
      await db
        .update(activationPins)
        .set({
          usedBy: newUser.id,
        })
        .where(eq(activationPins.id, pinRecord.id))

      console.log("✅ User registered and activated:", newUser.email)
    } else {
      // Create pending user
      const userResult = await db
        .insert(users)
        .values({
          memberId,
          firstName,
          lastName,
          email: email.toLowerCase(),
          phone,
          passwordHash,
          sponsorId: sponsor[0].memberId,
          uplineId: upline[0].memberId,
          location: location || null,
          status: "pending",
          role: "user",
          activationDate: null,
        })
        .returning()

      newUser = userResult[0]
      console.log("✅ User registered (pending payment):", newUser.email)
    }

    // Return success with user data
    return NextResponse.json({
      success: true,
      message:
        pinMethod === "existing"
          ? "Registration successful! Your account is now active. You can login immediately."
          : "Registration successful! Please proceed to payment to activate your account and receive your PIN.",
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
        message: "Registration is temporarily unavailable. Please try again in a few moments.",
      },
      { status: 500 },
    )
  }
}
