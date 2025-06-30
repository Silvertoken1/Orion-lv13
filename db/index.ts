import { drizzle } from "drizzle-orm/better-sqlite3"
import Database from "better-sqlite3"
import * as schema from "./schema"

const sqlite = new Database("sqlite.db")
export const db = drizzle(sqlite, { schema })

// Initialize database with admin user
export async function initializeDatabase() {
  try {
    // Check if admin user exists
    const adminExists = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, "admin@brightorian.com"),
    })

    if (!adminExists) {
      const bcrypt = await import("bcryptjs")
      const hashedPassword = await bcrypt.hash("admin123", 10)

      // Create admin user
      await db.insert(schema.users).values({
        memberId: "BO000001",
        firstName: "Admin",
        lastName: "User",
        email: "admin@brightorian.com",
        phone: "+2348000000000",
        passwordHash: hashedPassword,
        status: "active",
        role: "admin",
        activationDate: new Date(),
      })

      // Insert system settings
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

      console.log("Database initialized with admin user")
    }
  } catch (error) {
    console.error("Database initialization error:", error)
  }
}

export * from "./schema"
