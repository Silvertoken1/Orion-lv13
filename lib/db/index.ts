import { drizzle } from "drizzle-orm/neon-serverless"
import { neon } from "@neondatabase/serverless"
import * as schema from "./schema"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

const sql = neon(process.env.DATABASE_URL)
export const db = drizzle(sql, { schema })

// Test database connection
export function testConnection() {
  try {
    const result = sql.query("SELECT 1 as test").get()
    console.log("✅ Database connected successfully!")
    return true
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    return false
  }
}

// Initialize database with admin user and settings
export async function initializeDatabase() {
  try {
    console.log("🔄 Initializing database...")

    // Test connection first
    if (!testConnection()) {
      throw new Error("Database connection failed")
    }

    // Check if admin user exists
    const adminExists = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, process.env.ADMIN_EMAIL || "admin@brightorian.com"),
    })

    if (!adminExists) {
      console.log("Creating admin user...")
      const bcrypt = await import("bcryptjs")
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin123", 12)

      // Create admin user
      await db.insert(schema.users).values({
        memberId: "BO000001",
        firstName: "Admin",
        lastName: "User",
        email: process.env.ADMIN_EMAIL || "admin@brightorian.com",
        phone: process.env.ADMIN_PHONE || "+2348000000000",
        passwordHash: hashedPassword,
        status: "active",
        role: "admin",
        activationDate: new Date(),
      })

      console.log("✅ Admin user created")
    }

    // Check if system settings exist
    const settingsExist = await db.query.systemSettings.findFirst()

    if (!settingsExist) {
      console.log("Creating system settings...")
      const settings = [
        { settingKey: "package_price", settingValue: "36000" },
        { settingKey: "min_withdrawal", settingValue: "5000" },
        { settingKey: "level_1_commission", settingValue: "4000" },
        { settingKey: "level_2_commission", settingValue: "2000" },
        { settingKey: "level_3_commission", settingValue: "2000" },
        { settingKey: "level_4_commission", settingValue: "1500" },
        { settingKey: "level_5_commission", settingValue: "1500" },
        { settingKey: "level_6_commission", settingValue: "1500" },
        { settingKey: "max_matrix_levels", settingValue: "6" },
        { settingKey: "referrals_per_level", settingValue: "5" },
      ]

      for (const setting of settings) {
        await db.insert(schema.systemSettings).values(setting)
      }

      console.log("✅ System settings created")
    }

    console.log("✅ Database initialization complete!")
    return true
  } catch (error) {
    console.error("❌ Database initialization failed:", error)
    throw error
  }
}

// Export schema for use in other files
export * from "./schema"
