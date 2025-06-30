import { type NextRequest, NextResponse } from "next/server"
import { db, users, activationPins } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { generatePinCode } from "@/lib/utils"
import { eq } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    // Check if admin user already exists
    const adminEmail = process.env.ADMIN_EMAIL || "admin@brightorion.com"
    const existingAdmin = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1)

    if (existingAdmin.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Database already initialized",
      })
    }

    // Create admin user
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123"
    const hashedPassword = await hashPassword(adminPassword)

    const adminUser = await db
      .insert(users)
      .values({
        memberId: "ADMIN001",
        firstName: "Admin",
        lastName: "User",
        email: adminEmail,
        phone: process.env.ADMIN_PHONE || "+2348000000000",
        passwordHash: hashedPassword,
        sponsorId: "ADMIN001",
        uplineId: "ADMIN001",
        status: "active",
        role: "admin",
        activationDate: new Date(),
      })
      .returning()

    // Create initial PINs
    const pins = []
    for (let i = 0; i < 20; i++) {
      const pinCode = generatePinCode()
      const pin = await db
        .insert(activationPins)
        .values({
          pinCode,
          status: "available",
          createdBy: adminUser[0].id,
        })
        .returning()

      pins.push(pin[0])
    }

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
      admin: {
        email: adminUser[0].email,
        memberId: adminUser[0].memberId,
      },
      pinsCreated: pins.length,
    })
  } catch (error) {
    console.error("Database initialization error:", error)
    return NextResponse.json({ error: "Failed to initialize database" }, { status: 500 })
  }
}
