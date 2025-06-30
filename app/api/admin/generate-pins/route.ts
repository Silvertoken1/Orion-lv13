import { type NextRequest, NextResponse } from "next/server"
import { verifyTokenFromRequest } from "@/lib/auth"
import { db, activationPins } from "@/lib/db"
import { generatePinCode } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const user = await verifyTokenFromRequest(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { count } = await request.json()

    if (!count || count < 1 || count > 100) {
      return NextResponse.json({ error: "Invalid count. Must be between 1 and 100" }, { status: 400 })
    }

    const pins = []
    for (let i = 0; i < count; i++) {
      const pinCode = generatePinCode()
      const pinResult = await db
        .insert(activationPins)
        .values({
          pinCode,
          status: "available",
          createdBy: user.userId,
        })
        .returning()

      pins.push(pinResult[0])
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${count} PINs successfully`,
      pins: pins.map((p) => ({ id: p.id, pinCode: p.pinCode, status: p.status })),
    })
  } catch (error) {
    console.error("PIN generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
