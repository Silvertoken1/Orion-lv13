import { type NextRequest, NextResponse } from "next/server"
import { db, users } from "@/lib/db"
import { eq } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
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
    })
  } catch (error) {
    console.error("❌ Error fetching referral info:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch referral information" }, { status: 500 })
  }
}
