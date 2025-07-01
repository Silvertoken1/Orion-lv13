import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { getUserByMemberId } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sponsorId, uplineId } = await request.json()

    if (!sponsorId || !uplineId) {
      return NextResponse.json({ error: "Sponsor ID and Upline ID are required" }, { status: 400 })
    }

    // Get sponsor and upline information
    const sponsor = await getUserByMemberId(sponsorId)
    const upline = await getUserByMemberId(uplineId)

    if (!sponsor) {
      return NextResponse.json({ error: "Sponsor not found" }, { status: 404 })
    }

    if (!upline) {
      return NextResponse.json({ error: "Upline not found" }, { status: 404 })
    }

    // Generate referral link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const referralLink = `${baseUrl}/auth/register?sponsor=${sponsorId}&upline=${uplineId}`

    return NextResponse.json({
      success: true,
      referralLink,
      sponsor: {
        memberId: sponsor.memberId,
        firstName: sponsor.firstName,
        lastName: sponsor.lastName,
      },
      upline: {
        memberId: upline.memberId,
        firstName: upline.firstName,
        lastName: upline.lastName,
      },
    })
  } catch (error) {
    console.error("Error creating referral link:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
