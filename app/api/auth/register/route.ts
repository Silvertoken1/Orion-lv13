import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { hashPassword } from "@/lib/utils"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      fullName,
      email,
      phone,
      password,
      location,
      sponsorId,
      uplineId,
      pin,
      pinMethod,
      packagePrice,
      agreeTerms,
    } = body

    console.log("📝 Registration attempt:", { email, pinMethod, sponsorId, uplineId })

    // Validate required fields
    if (!fullName || !email || !phone || !password || !sponsorId || !uplineId) {
      return NextResponse.json(
        {
          success: false,
          message: "All required fields must be filled",
        },
        { status: 400 },
      )
    }

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email format",
        },
        { status: 400 },
      )
    }

    // Validate terms agreement
    if (!agreeTerms) {
      return NextResponse.json(
        {
          success: false,
          message: "You must agree to the terms and conditions",
        },
        { status: 400 },
      )
    }

    // Check if email already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase()} LIMIT 1
    `

    if (existingUser.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Email already registered",
        },
        { status: 400 },
      )
    }

    let validPin = null
    let sponsorUser = null
    let uplineUser = null

    // Validate PIN if using existing PIN method
    if (pinMethod === "existing") {
      if (!pin) {
        return NextResponse.json(
          {
            success: false,
            message: "PIN code is required",
          },
          { status: 400 },
        )
      }

      const pinResult = await sql`
        SELECT * FROM activation_pins 
        WHERE pin_code = ${pin.toUpperCase()} AND status = 'available' 
        LIMIT 1
      `

      if (pinResult.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid or already used PIN code",
          },
          { status: 400 },
        )
      }

      validPin = pinResult[0]
      console.log("✅ Valid PIN found:", pin)
    }

    // Validate sponsor exists
    const sponsor = await sql`
      SELECT * FROM users WHERE member_id = ${sponsorId.toUpperCase()} LIMIT 1
    `

    if (sponsor.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid sponsor ID",
        },
        { status: 400 },
      )
    }

    // Validate upline exists
    const upline = await sql`
      SELECT * FROM users WHERE member_id = ${uplineId.toUpperCase()} LIMIT 1
    `

    if (upline.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid upline ID",
        },
        { status: 400 },
      )
    }

    sponsorUser = sponsor[0]
    uplineUser = upline[0]

    // Hash password
    const passwordHash = await hashPassword(password)

    // Generate member ID
    const generateMemberId = () => {
      const prefix = "BO"
      const timestamp = Date.now().toString().slice(-6)
      const random = Math.random().toString(36).substring(2, 4).toUpperCase()
      return `${prefix}${timestamp}${random}`
    }

    const memberId = generateMemberId()

    // Split full name into first and last name
    const nameParts = fullName.trim().split(" ")
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(" ") || firstName

    // Create user
    const newUser = await sql`
      INSERT INTO users (
        member_id, first_name, last_name, email, phone, password_hash,
        location, sponsor_id, upline_id, status, role, activation_date,
        total_earnings, available_balance, total_referrals, created_at
      ) VALUES (
        ${memberId}, ${firstName}, ${lastName}, ${email.toLowerCase()}, ${phone},
        ${passwordHash}, ${location || null}, ${sponsorUser.member_id}, 
        ${uplineUser.member_id}, ${pinMethod === "existing" ? "active" : "pending"}, 
        'user', ${pinMethod === "existing" ? new Date().toISOString() : null},
        '0.00', '0.00', 0, ${new Date().toISOString()}
      ) RETURNING *
    `

    console.log("✅ User created:", newUser[0].member_id)

    // Mark PIN as used if applicable
    if (validPin) {
      await sql`
        UPDATE activation_pins 
        SET status = 'used', used_by = ${newUser[0].id}, used_at = ${new Date().toISOString()}
        WHERE id = ${validPin.id}
      `
      console.log("✅ PIN marked as used:", pin)
    }

    // Update sponsor's referral count
    await sql`
      UPDATE users 
      SET total_referrals = total_referrals + 1
      WHERE id = ${sponsorUser.id}
    `

    console.log("✅ Sponsor referral count updated")

    // Create payment record for tracking
    const paymentReference = `BO_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`

    await sql`
      INSERT INTO payments (
        user_id, reference, amount, currency, status, payment_method,
        package_type, created_at
      ) VALUES (
        ${newUser[0].id}, ${paymentReference}, ${packagePrice}, 'NGN', 
        'pending', 'paystack', 'starter', ${new Date().toISOString()}
      )
    `

    return NextResponse.json({
      success: true,
      message:
        pinMethod === "existing"
          ? "Registration successful! Redirecting to payment..."
          : "Registration successful! Complete payment to receive your PIN.",
      user: {
        id: newUser[0].id,
        memberId: newUser[0].member_id,
        fullName: fullName,
        email: newUser[0].email,
        status: newUser[0].status,
        sponsorId: newUser[0].sponsor_id,
        uplineId: newUser[0].upline_id,
        paymentReference: paymentReference,
      },
    })
  } catch (error) {
    console.error("❌ Registration error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Registration failed. Please try again later.",
      },
      { status: 500 },
    )
  }
}
