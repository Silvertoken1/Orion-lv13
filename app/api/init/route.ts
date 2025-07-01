import { NextResponse } from "next/server"
import { db, users, activationPins, systemSettings } from "@/lib/db"
import { hashPassword } from "@/lib/utils"
import { generatePinCode } from "@/lib/utils"
import { eq } from "drizzle-orm"

export async function GET() {
  try {
    console.log("🔄 Initializing production database...")

    // Check if master user exists
    const masterExists = await db.select().from(users).where(eq(users.memberId, "MASTER001")).limit(1)

    if (masterExists.length === 0) {
      console.log("Creating master user...")
      const hashedPassword = await hashPassword("master123")

      await db.insert(users).values({
        memberId: "MASTER001",
        firstName: "Master",
        lastName: "Sponsor",
        email: "master@brightorion.com",
        phone: "+2348000000000",
        password: hashedPassword,
        sponsorId: null,
        uplineId: null,
        status: "active",
        role: "user",
        isActivated: true,
        totalEarnings: "100000.00",
        availableBalance: "50000.00",
        totalReferrals: 25,
      })

      console.log("✅ Master user created")
    }

    // Check if admin user exists
    const adminExists = await db.select().from(users).where(eq(users.email, "admin@brightorion.com")).limit(1)

    if (adminExists.length === 0) {
      console.log("Creating admin user...")
      const hashedPassword = await hashPassword("admin123")

      await db.insert(users).values({
        memberId: "ADMIN001",
        firstName: "Admin",
        lastName: "User",
        email: "admin@brightorion.com",
        phone: "+2348111111111",
        password: hashedPassword,
        sponsorId: "MASTER001",
        uplineId: "MASTER001",
        status: "active",
        role: "admin",
        isActivated: true,
        totalEarnings: "0.00",
        availableBalance: "0.00",
        totalReferrals: 0,
      })

      console.log("✅ Admin user created")
    }

    // Create master PIN codes
    const masterPins = ["MASTER2024", "BRIGHT001", "ORION123", "ADMIN999", "TEST1234"]

    for (const pinCode of masterPins) {
      const pinExists = await db.select().from(activationPins).where(eq(activationPins.pin, pinCode)).limit(1)

      if (pinExists.length === 0) {
        await db.insert(activationPins).values({
          pin: pinCode,
          isUsed: false,
        })
      }
    }

    // Generate additional random PINs
    for (let i = 0; i < 15; i++) {
      const randomPin = generatePinCode()
      const pinExists = await db.select().from(activationPins).where(eq(activationPins.pin, randomPin)).limit(1)

      if (pinExists.length === 0) {
        await db.insert(activationPins).values({
          pin: randomPin,
          isUsed: false,
        })
      }
    }

    console.log("✅ Master PINs created")

    // Create system settings
    const settingsData = [
      { settingKey: "package_price", settingValue: "36000", description: "Package registration price in NGN" },
      { settingKey: "min_withdrawal", settingValue: "5000", description: "Minimum withdrawal amount in NGN" },
      { settingKey: "level_1_commission", settingValue: "4000", description: "Level 1 commission amount" },
      { settingKey: "level_2_commission", settingValue: "2000", description: "Level 2 commission amount" },
      { settingKey: "level_3_commission", settingValue: "2000", description: "Level 3 commission amount" },
      { settingKey: "level_4_commission", settingValue: "1500", description: "Level 4 commission amount" },
      { settingKey: "level_5_commission", settingValue: "1500", description: "Level 5 commission amount" },
      { settingKey: "level_6_commission", settingValue: "1500", description: "Level 6 commission amount" },
      { settingKey: "max_matrix_levels", settingValue: "6", description: "Maximum matrix levels" },
      { settingKey: "referrals_per_level", settingValue: "5", description: "Maximum referrals per level" },
    ]

    for (const setting of settingsData) {
      const settingExists = await db
        .select()
        .from(systemSettings)
        .where(eq(systemSettings.settingKey, setting.settingKey))
        .limit(1)

      if (settingExists.length === 0) {
        await db.insert(systemSettings).values(setting)
      }
    }

    console.log("✅ System settings created")

    return NextResponse.json({
      success: true,
      message: "Production database initialized successfully!",
      data: {
        masterAccount: {
          email: "master@brightorion.com",
          password: "master123",
          memberId: "MASTER001",
          note: "This is the MASTER SPONSOR account - use MASTER001 as Sponsor ID and Upline ID for new registrations",
        },
        adminAccount: {
          email: "admin@brightorion.com",
          password: "admin123",
          memberId: "ADMIN001",
          note: "Admin account for system management",
        },
        masterPins: masterPins,
        registrationInfo: {
          sponsorId: "MASTER001",
          uplineId: "MASTER001",
          availablePins: masterPins,
        },
      },
    })
  } catch (error) {
    console.error("❌ Database initialization failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Database initialization failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  return GET()
}
