import { type NextRequest, NextResponse } from "next/server"
import { db, users, commissions } from "@/lib/db"
import { eq, and, sum } from "drizzle-orm"
import { verifyTokenFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyTokenFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Get user profile
    const userProfile = await db.select().from(users).where(eq(users.id, user.userId)).limit(1)

    if (userProfile.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const profile = userProfile[0]

    // Get user statistics
    const totalEarnings = await db
      .select({ total: sum(commissions.amount) })
      .from(commissions)
      .where(and(eq(commissions.userId, user.userId), eq(commissions.status, "approved")))

    const pendingEarnings = await db
      .select({ total: sum(commissions.amount) })
      .from(commissions)
      .where(and(eq(commissions.userId, user.userId), eq(commissions.status, "pending")))

    // Get referrals count
    const referralsCount = await db.select().from(users).where(eq(users.sponsorId, profile.memberId))

    return NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        memberId: profile.memberId,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        status: profile.status,
        role: profile.role,
        activationDate: profile.activationDate,
        location: profile.location,
      },
      stats: {
        totalEarnings: Number(totalEarnings[0]?.total || 0),
        pendingEarnings: Number(pendingEarnings[0]?.total || 0),
        availableBalance: Number(profile.availableBalance || 0),
        referralsCount: referralsCount.length,
      },
    })
  } catch (error) {
    console.error("Profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
