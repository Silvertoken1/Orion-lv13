import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { createPin } from "@/lib/db"
import { generatePinCode } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { count } = await request.json()

    if (!count || count < 1 || count > 100) {
      return NextResponse.json({ error: "Invalid PIN count (1-100)" }, { status: 400 })
    }

    const generatedPins = []
    for (let i = 0; i < count; i++) {
      const pinCode = generatePinCode()
      const pin = await createPin(pinCode, decoded.userId)
      generatedPins.push(pin)
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${count} PINs successfully`,
      pins: generatedPins,
    })
  } catch (error) {
    console.error("PIN generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
