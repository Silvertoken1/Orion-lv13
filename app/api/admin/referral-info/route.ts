import { type NextRequest, NextResponse } from "next/server"
import { db, users } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { eq, desc } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    // Get user details
    const user = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1)
    if (user.length === 0 || user[0].role !== "admin") {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
    }

    // Get all active users who can be sponsors/uplines
    const activeUsers = await db
      .select({
        id: users.id,
        memberId: users.memberId,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        totalReferrals: users.totalReferrals,
        status: users.status,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.status, "active"))
      .orderBy(desc(users.totalReferrals), desc(users.createdAt))

    // Get master account info
    const masterAccount = activeUsers.find((u) => u.memberId === "MASTER001")

    return NextResponse.json({
      success: true,
      data: {
        masterAccount,
        activeUsers,
        totalActiveUsers: activeUsers.length,
        recommendedSponsor: masterAccount || activeUsers[0],
      },
    })
  } catch (error) {
    console.error("❌ Error fetching referral info:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch referral information" }, { status: 500 })
  }
}
