import { type NextRequest, NextResponse } from "next/server"
import { createPin, updateUser, getUserById, usePin, createPayment } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const reference = searchParams.get("reference")
  const userId = parseInt(searchParams.get("userId") || "0")

  if (!reference || !userId) {
    return NextResponse.json({ error: "Missing payment reference or user ID" }, { status: 400 })
  }

  try {
    // Verify payment with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    })

    const result = await response.json()

    if (result.status !== true || result.data.status !== "success") {
      return NextResponse.json({ error: "Payment not successful" }, { status: 400 })
    }

    const user = await getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create payment record
    await createPayment({
      userId: user.id,
      amount: result.data.amount / 100,
      type: "registration",
      reference,
      status: "completed",
    })

    // Generate PIN and mark as used
    const newPinCode = uuidv4().slice(0, 8).toUpperCase()
    const newPin = await createPin(newPinCode, user.id)
    await usePin(newPin.pinCode, user.id)

    // Update user as active
    await updateUser(user.id, {
      status: "active",
      activationDate: new Date().toISOString(),
    })

    // Redirect to login
    return NextResponse.redirect(new URL("/auth/login?payment=success", req.url))
  } catch (error) {
    console.error("Payment verification failed:", error)
    return NextResponse.json({ error: "Verification error" }, { status: 500 })
  }
}
