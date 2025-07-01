import { type NextRequest, NextResponse } from "next/server"
import { db, activationPins } from "@/lib/db"
import { verifyTokenFromRequest } from "@/lib/auth"
import { generatePinCode } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const decoded = await verifyTokenFromRequest(request)

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { count } = await request.json()

    if (!count || count < 1 || count > 100) {
      return NextResponse.json({ error: "Count must be between 1 and 100" }, { status: 400 })
    }

    const generatedPins = []

    for (let i = 0; i < count; i++) {
      const pinCode = generatePinCode()

      const pin = await db
        .insert(activationPins)
        .values({
          pinCode,
          status: "available",
          createdBy: decoded.userId,
        })
        .returning()

      generatedPins.push(pin[0])
    }

    return NextResponse.json({
      success: true,
      message: `${count} PINs generated successfully`,
      pins: generatedPins,
    })
  } catch (error) {
    console.error("PIN generation error:", error)
    return NextResponse.json({ error: "Failed to generate PINs" }, { status: 500 })
  }
}
