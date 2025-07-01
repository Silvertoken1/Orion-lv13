import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { pgTable, text, timestamp, boolean, integer, decimal, varchar, serial } from "drizzle-orm/pg-core"
import { eq, and, desc, count, sum } from "drizzle-orm"

// Database connection
const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql)

// Database schemas
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  memberId: varchar("member_id", { length: 20 }).unique().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: text("password").notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  sponsorId: varchar("sponsor_id", { length: 20 }),
  uplineId: varchar("upline_id", { length: 20 }),
  role: varchar("role", { length: 20 }).default("user").notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  isEmailVerified: boolean("is_email_verified").default(false).notNull(),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default("0.00"),
  availableBalance: decimal("available_balance", { precision: 10, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const activationPins = pgTable("activation_pins", {
  id: serial("id").primaryKey(),
  pinCode: varchar("pin_code", { length: 20 }).unique().notNull(),
  isUsed: boolean("is_used").default(false).notNull(),
  usedBy: varchar("used_by", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  usedAt: timestamp("used_at"),
})

export const commissions = pgTable("commissions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 20 }).notNull(),
  fromUserId: varchar("from_user_id", { length: 20 }).notNull(),
  level: integer("level").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: varchar("type", { length: 50 }).default("referral").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 20 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  reference: varchar("reference", { length: 100 }).unique(),
  paymentMethod: varchar("payment_method", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const stockists = pgTable("stockists", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 20 }).notNull(),
  businessName: varchar("business_name", { length: 200 }).notNull(),
  businessAddress: text("business_address").notNull(),
  state: varchar("state", { length: 50 }).notNull(),
  lga: varchar("lga", { length: 100 }).notNull(),
  bankName: varchar("bank_name", { length: 100 }).notNull(),
  accountNumber: varchar("account_number", { length: 20 }).notNull(),
  accountName: varchar("account_name", { length: 200 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  stockLevel: integer("stock_level").default(0).notNull(),
  totalSales: decimal("total_sales", { precision: 10, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Database functions
export async function createUser(userData: any) {
  try {
    const [user] = await db.insert(users).values(userData).returning()
    return { success: true, user }
  } catch (error) {
    console.error("Error creating user:", error)
    return { success: false, error: "Failed to create user" }
  }
}

export async function getUserByEmail(email: string) {
  try {
    const [user] = await db.select().from(users).where(eq(users.email, email))
    return user
  } catch (error) {
    console.error("Error getting user by email:", error)
    return null
  }
}

export async function getUserByMemberId(memberId: string) {
  try {
    const [user] = await db.select().from(users).where(eq(users.memberId, memberId))
    return user
  } catch (error) {
    console.error("Error getting user by member ID:", error)
    return null
  }
}

export async function updateUser(memberId: string, updates: any) {
  try {
    const [user] = await db.update(users).set(updates).where(eq(users.memberId, memberId)).returning()
    return { success: true, user }
  } catch (error) {
    console.error("Error updating user:", error)
    return { success: false, error: "Failed to update user" }
  }
}

export async function createActivationPin(pinCode: string) {
  try {
    const [pin] = await db.insert(activationPins).values({ pinCode }).returning()
    return { success: true, pin }
  } catch (error) {
    console.error("Error creating activation pin:", error)
    return { success: false, error: "Failed to create activation pin" }
  }
}

export async function validateActivationPin(pinCode: string) {
  try {
    const [pin] = await db
      .select()
      .from(activationPins)
      .where(and(eq(activationPins.pinCode, pinCode), eq(activationPins.isUsed, false)))
    return pin
  } catch (error) {
    console.error("Error validating activation pin:", error)
    return null
  }
}

export async function useActivationPin(pinCode: string, usedBy: string) {
  try {
    const [pin] = await db
      .update(activationPins)
      .set({
        isUsed: true,
        usedBy,
        usedAt: new Date(),
      })
      .where(eq(activationPins.pinCode, pinCode))
      .returning()
    return { success: true, pin }
  } catch (error) {
    console.error("Error using activation pin:", error)
    return { success: false, error: "Failed to use activation pin" }
  }
}

export async function createCommission(commissionData: any) {
  try {
    const [commission] = await db.insert(commissions).values(commissionData).returning()
    return { success: true, commission }
  } catch (error) {
    console.error("Error creating commission:", error)
    return { success: false, error: "Failed to create commission" }
  }
}

export async function getUserCommissions(userId: string) {
  try {
    const userCommissions = await db
      .select()
      .from(commissions)
      .where(eq(commissions.userId, userId))
      .orderBy(desc(commissions.createdAt))
    return userCommissions
  } catch (error) {
    console.error("Error getting user commissions:", error)
    return []
  }
}

export async function getAllUsers() {
  try {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt))
    return allUsers
  } catch (error) {
    console.error("Error getting all users:", error)
    return []
  }
}

export async function getActiveUsers() {
  try {
    const activeUsers = await db.select().from(users).where(eq(users.isActive, true))
    return activeUsers
  } catch (error) {
    console.error("Error getting active users:", error)
    return []
  }
}

export async function getUnusedPins() {
  try {
    const unusedPins = await db.select().from(activationPins).where(eq(activationPins.isUsed, false))
    return unusedPins
  } catch (error) {
    console.error("Error getting unused pins:", error)
    return []
  }
}

export async function getUsedPins() {
  try {
    const usedPins = await db.select().from(activationPins).where(eq(activationPins.isUsed, true))
    return usedPins
  } catch (error) {
    console.error("Error getting used pins:", error)
    return []
  }
}

export async function getDashboardStats() {
  try {
    const [totalUsersResult] = await db.select({ count: count() }).from(users)
    const [activeUsersResult] = await db.select({ count: count() }).from(users).where(eq(users.isActive, true))
    const [totalEarningsResult] = await db.select({ total: sum(users.totalEarnings) }).from(users)
    const [unusedPinsResult] = await db
      .select({ count: count() })
      .from(activationPins)
      .where(eq(activationPins.isUsed, false))

    return {
      totalUsers: totalUsersResult.count || 0,
      activeUsers: activeUsersResult.count || 0,
      totalEarnings: totalEarningsResult.total || "0.00",
      unusedPins: unusedPinsResult.count || 0,
    }
  } catch (error) {
    console.error("Error getting dashboard stats:", error)
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalEarnings: "0.00",
      unusedPins: 0,
    }
  }
}

// Legacy function for backward compatibility
export async function getDatabase() {
  return db
}
