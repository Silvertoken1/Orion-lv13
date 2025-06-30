import { type NextRequest, NextResponse } from "next/server"
import { updateUser, createPin } from "@/lib/db"
import { emailService } from "@/lib/email-service"
import { generatePin, generateTrackingNumber } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, amount, reference, status, pinMethod } = body

    if (status !== "success") {
      return NextResponse.json({ error: "Payment not successful" }, { status: 400 })
    }

    // Get user data from the request or database
    const user = body.user

    if (!user) {
      return NextResponse.json({ error: "User data not found" }, { status: 400 })
    }

    let activationPin = null
    const trackingNumber = generateTrackingNumber()

    // Generate PIN automatically for online purchases
    if (pinMethod === "new") {
      activationPin = generatePin()

      // Create PIN record in database
      await createPin(activationPin, 1) // System generated (admin ID = 1)

      // Update user status to active and set activation date
      await updateUser(userId, {
        status: "active",
        activationDate: new Date().toISOString(),
      })

      // Send email with PIN and tracking number
      try {
        await emailService.sendPaymentConfirmationWithPin(
          user.email,
          user.firstName,
          trackingNumber,
          activationPin,
          amount,
        )
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError)
      }
    } else {
      // For existing PIN users, just send tracking number
      try {
        const template = emailService.getPaymentConfirmationTemplate(user.firstName, trackingNumber)
        await emailService.sendEmail({
          to: user.email,
          from: process.env.FROM_EMAIL || "noreply@brightorian.com",
          subject: template.subject,
          html: template.html,
          text: template.text,
        })
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment processed successfully",
      payment: {
        reference,
        amount,
        status: "completed",
      },
      trackingNumber,
      activationPin,
      user: {
        id: user.id,
        memberId: user.memberId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        status: pinMethod === "new" ? "active" : user.status,
      },
    })
  } catch (error) {
    console.error("Payment processing error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
