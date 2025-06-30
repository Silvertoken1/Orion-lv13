import { type NextRequest, NextResponse } from "next/server"
import { db, users } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { eq } from "drizzle-orm"

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { sponsorId, uplineId, customMessage } = body

    // Validate sponsor exists
    const sponsor = await db.select().from(users).where(eq(users.memberId, sponsorId)).limit(1)
    if (sponsor.length === 0) {
      return NextResponse.json({ success: false, error: "Invalid sponsor ID" }, { status: 400 })
    }

    // Validate upline exists
    const upline = await db.select().from(users).where(eq(users.memberId, uplineId)).limit(1)
    if (upline.length === 0) {
      return NextResponse.json({ success: false, error: "Invalid upline ID" }, { status: 400 })
    }

    // Create referral information
    const referralInfo = {
      sponsorId,
      uplineId,
      sponsorName: `${sponsor[0].firstName} ${sponsor[0].lastName}`,
      uplineName: `${upline[0].firstName} ${upline[0].lastName}`,
      registrationUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/register?sponsor=${sponsorId}&upline=${uplineId}`,
      message: customMessage || `Join Bright Orion MLM! Use Sponsor ID: ${sponsorId} and Upline ID: ${uplineId}`,
      createdAt: new Date().toISOString(),
      createdBy: user[0].memberId,
    }

    return NextResponse.json({
      success: true,
      referralInfo,
    })
  } catch (error) {
    console.error("❌ Error creating referral link:", error)
    return NextResponse.json({ success: false, error: "Failed to create referral link" }, { status: 500 })
  }
}
