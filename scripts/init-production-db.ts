import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import bcrypt from "bcryptjs"
import { users, pins } from "../lib/db/schema"
import { productionConfig } from "../lib/config/production"

async function initProductionDatabase() {
  try {
    console.log("🚀 Initializing production database...")

    const client = postgres(productionConfig.database.url, {
      ssl: productionConfig.database.ssl ? "require" : false,
    })

    const db = drizzle(client)

    // Create admin user
    const hashedPassword = await bcrypt.hash(productionConfig.admin.password, 10)

    await db
      .insert(users)
      .values({
        id: "ADMIN001",
        fullName: "System Administrator",
        email: productionConfig.admin.email,
        phone: productionConfig.admin.phone,
        password: hashedPassword,
        role: "admin",
        status: "active",
        isEmailVerified: true,
        isPhoneVerified: true,
        sponsorId: null,
        uplineId: null,
        level: 0,
        totalEarnings: 0,
        availableBalance: 0,
        totalReferrals: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoNothing()

    // Generate initial PINs
    const initialPins = []
    for (let i = 1; i <= 100; i++) {
      const pinCode = `PIN${String(i).padStart(6, "0")}`
      initialPins.push({
        code: pinCode,
        isUsed: false,
        createdBy: "ADMIN001",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    await db.insert(pins).values(initialPins).onConflictDoNothing()

    console.log("✅ Production database initialized successfully!")
    console.log(`📧 Admin email: ${productionConfig.admin.email}`)
    console.log("🔑 100 initial PINs generated")

    await client.end()
  } catch (error) {
    console.error("❌ Error initializing production database:", error)
    process.exit(1)
  }
}

if (require.main === module) {
  initProductionDatabase()
}

export { initProductionDatabase }
