import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { db, users } from "@/lib/db"
import { eq } from "drizzle-orm"

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

    const { sponsorId, uplineId } = await request.json()

    if (!sponsorId || !uplineId) {
      return NextResponse.json({ error: "Sponsor ID and Upline ID are required" }, { status: 400 })
    }

    // Verify sponsor exists
    const sponsor = await db
      .select({
        memberId: users.memberId,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(users)
      .where(eq(users.memberId, sponsorId.toUpperCase()))
      .limit(1)

    if (sponsor.length === 0) {
      return NextResponse.json({ error: "Sponsor not found" }, { status: 404 })
    }

    // Verify upline exists
    const upline = await db
      .select({
        memberId: users.memberId,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(users)
      .where(eq(users.memberId, uplineId.toUpperCase()))
      .limit(1)

    if (upline.length === 0) {
      return NextResponse.json({ error: "Upline not found" }, { status: 404 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const referralLink = `${baseUrl}/auth/register?sponsor=${sponsorId}&upline=${uplineId}`

    return NextResponse.json({
      success: true,
      referralLink,
      sponsor: sponsor[0],
      upline: upline[0],
    })
  } catch (error) {
    console.error("Error creating referral link:", error)
    return NextResponse.json({ error: "Failed to create referral link" }, { status: 500 })
  }
}
