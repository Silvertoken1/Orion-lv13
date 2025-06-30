import { type NextRequest, NextResponse } from "next/server"
import { db, users } from "@/lib/db"
import { eq } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const { sponsorId, uplineId } = await request.json()

    if (!sponsorId || !uplineId) {
      return NextResponse.json({ success: false, error: "Sponsor ID and Upline ID are required" }, { status: 400 })
    }

    // Verify sponsor exists
    const sponsor = await db
      .select({
        memberId: users.memberId,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(users)
      .where(eq(users.memberId, sponsorId.toUpperCase()))
      .limit(1)

    if (sponsor.length === 0) {
      return NextResponse.json({ success: false, error: "Invalid sponsor ID" }, { status: 400 })
    }

    // Verify upline exists
    const upline = await db
      .select({
        memberId: users.memberId,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(users)
      .where(eq(users.memberId, uplineId.toUpperCase()))
      .limit(1)

    if (upline.length === 0) {
      return NextResponse.json({ success: false, error: "Invalid upline ID" }, { status: 400 })
    }

    // Create referral link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const referralLink = `${baseUrl}/auth/register?sponsor=${sponsorId}&upline=${uplineId}`

    return NextResponse.json({
      success: true,
      referralLink,
      sponsor: sponsor[0],
      upline: upline[0],
    })
  } catch (error) {
    console.error("❌ Error creating referral link:", error)
    return NextResponse.json({ success: false, error: "Failed to create referral link" }, { status: 500 })
  }
}
