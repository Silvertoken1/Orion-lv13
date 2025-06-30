import { type NextRequest, NextResponse } from "next/server"
import { db, users } from "@/lib/db"
import { eq } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const { sponsorId, uplineId } = await request.json()

    if (!sponsorId || !uplineId) {
      return NextResponse.json(
        {
          success: false,
          error: "Sponsor ID and Upline ID are required",
        },
        { status: 400 },
      )
    }

    // Verify sponsor exists
    const sponsor = await db.select().from(users).where(eq(users.memberId, sponsorId)).limit(1)

    if (sponsor.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Sponsor not found",
        },
        { status: 404 },
      )
    }

    // Verify upline exists
    const upline = await db.select().from(users).where(eq(users.memberId, uplineId)).limit(1)

    if (upline.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Upline not found",
        },
        { status: 404 },
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://localhost:3000"
    const referralLink = `${baseUrl}/auth/register?sponsor=${sponsorId}&upline=${uplineId}`

    return NextResponse.json({
      success: true,
      data: {
        referralLink,
        sponsorInfo: {
          memberId: sponsor[0].memberId,
          name: `${sponsor[0].firstName} ${sponsor[0].lastName}`,
          email: sponsor[0].email,
        },
        uplineInfo: {
          memberId: upline[0].memberId,
          name: `${upline[0].firstName} ${upline[0].lastName}`,
          email: upline[0].email,
        },
        registrationDetails: {
          sponsorId,
          uplineId,
          registrationUrl: referralLink,
          instructions: [
            "Share this link with new users",
            "They can register directly using this link",
            "Sponsor and Upline information will be pre-filled",
            "Registration will be instant upon completion",
          ],
        },
      },
    })
  } catch (error) {
    console.error("Error creating referral link:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create referral link",
      },
      { status: 500 },
    )
  }
}
