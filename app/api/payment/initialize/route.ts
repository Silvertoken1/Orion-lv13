// File: app/api/payment/initiate/route.ts

import { NextRequest, NextResponse } from "next/server"
import { createPayment } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!
const PAYSTACK_PUBLIC = process.env.PAYSTACK_PUBLIC_KEY!
const CALLBACK_URL = process.env.NEXT_PUBLIC_APP_URL + "/payment/callback"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, email, amount } = body

    if (!userId || !email || !amount) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const reference = uuidv4()

    await createPayment({
      userId,
      amount,
      type: "registration",
      status: "pending",
      reference,
    })

    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // Paystack uses kobo
        reference,
        callback_url: CALLBACK_URL,
      }),
    })

    const result = await paystackRes.json()

    if (!result.status) {
      return NextResponse.json({ error: result.message || "Payment failed" }, { status: 400 })
    }

    return NextResponse.json({ success: true, paymentUrl: result.data.authorization_url })
  } catch (err) {
    console.error("Paystack init error:", err)
    return NextResponse.json({ error: "Failed to initiate payment" }, { status: 500 })
  }
}
