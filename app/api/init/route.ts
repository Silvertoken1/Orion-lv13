import { NextResponse } from "next/server"
import { initializeDatabase, getUserByEmail } from "@/lib/db"

export async function GET() {
  try {
    await initializeDatabase()

    const adminEmail = process.env.ADMIN_EMAIL || "admin@brightorian.com"
    const testEmail = "test@brightorian.com"

    // Optionally verify the test user exists
    const testUser = await getUserByEmail(testEmail)

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
      credentials: {
        admin: {
          email: adminEmail,
          password: process.env.ADMIN_PASSWORD || "admin123",
        },
        testUser: testUser
          ? {
              email: testEmail,
              password: "admin123",
            }
          : null,
      },
    })
  } catch (error) {
    console.error("Database initialization error:", error)
    return NextResponse.json(
      { error: "Failed to initialize database" },
      { status: 500 }
    )
  }
}
