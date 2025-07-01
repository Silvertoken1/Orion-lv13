import { type NextRequest, NextResponse } from "next/server"
import { verifyPaystackPayment } from "@/lib/payment/paystack"
import { updatePayment, createPayment, getUserByMemberId } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get("reference")

    if (!reference) {
      return NextResponse.json({ error: "Reference is required" }, { status: 400 })
    }

    const verification = await verifyPaystackPayment(reference)

    if (verification.status && verification.data.status === "success") {
      const { data } = verification
      const memberId = data.metadata?.memberId

      if (memberId) {
        const user = await getUserByMemberId(memberId)
        if (user) {
          // Update or create payment record
          try {
            await updatePayment(reference, {
              status: "completed",
              metadata: JSON.stringify(data.metadata),
              updatedAt: new Date(),
            })
          } catch {
            // If payment doesn't exist, create it
            await createPayment({
              userId: user.id,
              memberId: user.memberId,
              amount: (data.amount / 100).toString(),
              reference: reference,
              status: "completed",
              paymentMethod: "paystack",
              metadata: JSON.stringify(data.metadata),
            })
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
        data: {
          reference: data.reference,
          amount: data.amount / 100,
          status: data.status,
        },
      })
    } else {
      return NextResponse.json({
        success: false,
        message: "Payment verification failed",
      })
    }
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
