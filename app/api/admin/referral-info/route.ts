import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { getActiveUsers } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const users = await getActiveUsers()

    return NextResponse.json({
      success: true,
      users: users.map((u) => ({
        id: u.id,
        memberId: u.memberId,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        status: u.status,
      })),
    })
  } catch (error) {
    console.error("Error fetching referral info:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
