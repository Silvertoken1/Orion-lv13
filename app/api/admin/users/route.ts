import { type NextRequest, NextResponse } from "next/server"
import { verifyTokenFromRequest } from "@/lib/auth"
import { db, users } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyTokenFromRequest(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const allUsers = await db.select().from(users).orderBy(users.createdAt)

    return NextResponse.json({
      success: true,
      users: allUsers.map((u) => ({
        id: u.id,
        memberId: u.memberId,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phone: u.phone,
        status: u.status,
        role: u.role,
        sponsorId: u.sponsorId,
        uplineId: u.uplineId,
        location: u.location,
        activationDate: u.activationDate,
        createdAt: u.createdAt,
      })),
    })
  } catch (error) {
    console.error("Users fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
