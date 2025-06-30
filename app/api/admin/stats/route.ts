import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { getAllUsers, getAllPins, getAllCommissions } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const users = await getAllUsers()
    const pins = await getAllPins()
    const commissions = await getAllCommissions()

    const stats = {
      totalUsers: users.length,
      totalEarnings: users.reduce((sum, user) => sum + user.totalEarnings, 0),
      pendingCommissions: commissions.filter((c) => c.status === "pending").reduce((sum, c) => sum + c.amount, 0),
      availablePins: pins.filter((p) => p.status === "available").length,
    }

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("Stats fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
