import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { db, users } from "@/lib/db"
import { eq } from "drizzle-orm"

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

    // Get all active users for sponsor/upline selection
    const activeUsers = await db
      .select({
        id: users.id,
        memberId: users.memberId,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        status: users.status,
      })
      .from(users)
      .where(eq(users.status, "active"))

    return NextResponse.json({
      success: true,
      users: activeUsers,
      masterInfo: {
        sponsorId: "MASTER001",
        uplineId: "MASTER001",
        note: "Default master sponsor for all new registrations",
      },
    })
  } catch (error) {
    console.error("Error fetching referral info:", error)
    return NextResponse.json({ error: "Failed to fetch referral information" }, { status: 500 })
  }
}
