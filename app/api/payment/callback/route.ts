import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, fullName, phone, packagePrice } = body

    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: packagePrice * 100, // Paystack expects amount in kobo
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/payment/callback`,
        metadata: { fullName, phone },
      }),
    })

    const result = await paystackRes.json()

    if (result.status) {
      return NextResponse.json({ success: true, authorization_url: result.data.authorization_url })
    } else {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 })
    }
  } catch (error) {
    console.error("Payment error:", error)
    return NextResponse.json({ success: false, message: "Payment initiation failed." }, { status: 500 })
  }
}
