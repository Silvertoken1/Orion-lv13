import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { pgTable, text, timestamp, boolean, integer, decimal, varchar, serial } from "drizzle-orm/pg-core"
import { eq, and, desc, count, sum } from "drizzle-orm"

// Database connection
const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql)

// Database schemas - THESE ARE THE MISSING EXPORTS
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  memberId: varchar("member_id", { length: 20 }).unique().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  sponsorId: varchar("sponsor_id", { length: 20 }),
  uplineId: varchar("upline_id", { length: 20 }),
  role: varchar("role", { length: 20 }).default("user").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  isEmailVerified: boolean("is_email_verified").default(false).notNull(),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default("0.00"),
  availableBalance: decimal("available_balance", { precision: 10, scale: 2 }).default("0.00"),
  totalReferrals: integer("total_referrals").default(0).notNull(),
  activationDate: timestamp("activation_date"),
  location: varchar("location", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const activationPins = pgTable("activation_pins", {
  id: serial("id").primaryKey(),
  pinCode: varchar("pin_code", { length: 20 }).unique().notNull(),
  status: varchar("status", { length: 20 }).default("available").notNull(),
  isUsed: boolean("is_used").default(false).notNull(),
  usedBy: integer("used_by"),
  createdBy: integer("created_by"),
  generatedBy: integer("generated_by"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  usedAt: timestamp("used_at"),
})

export const commissions = pgTable("commissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  fromUserId: integer("from_user_id").notNull(),
  level: integer("level").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
  type: varchar("type", { length: 50 }).default("referral").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  paymentId: integer("payment_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  reference: varchar("reference", { length: 100 }).unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("NGN").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  trackingNumber: varchar("tracking_number", { length: 50 }),
  paymentMethod: varchar("payment_method", { length: 50 }),
  packageType: varchar("package_type", { length: 50 }),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const stockists = pgTable("stockists", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 20 }).notNull(),
  businessName: varchar("business_name", { length: 200 }).notNull(),
  ownerName: varchar("owner_name", { length: 200 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 50 }).notNull(),
  password: text("password").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  stockLevel: integer("stock_level").default(0).notNull(),
  totalSales: decimal("total_sales", { precision: 10, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  settingKey: varchar("setting_key", { length: 100 }).unique().notNull(),
  settingValue: text("setting_value").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const withdrawals = pgTable("withdrawals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  bankName: varchar("bank_name", { length: 100 }).notNull(),
  accountNumber: varchar("account_number", { length: 20 }).notNull(),
  accountName: varchar("account_name", { length: 100 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
})

// Database functions - THIS FIXES THE getDatabase IMPORT ERROR
export async function getDatabase() {
  return {
    users: await db.select().from(users),
    stockists: await db.select().from(stockists),
    activationPins: await db.select().from(activationPins),
    payments: await db.select().from(payments),
    commissions: await db.select().from(commissions),
    systemSettings: await db.select().from(systemSettings),
    withdrawals: await db.select().from(withdrawals),
  }
}

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
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.memberId, memberId))
      .returning()
    return { success: true, user }
  } catch (error) {
    console.error("Error updating user:", error)
    return { success: false, error: "Failed to update user" }
  }
}

export async function createActivationPin(pinCode: string, createdBy?: string) {
  try {
    const [pin] = await db
      .insert(activationPins)
      .values({
        pinCode,
        createdBy: createdBy ? Number.parseInt(createdBy) : null,
        generatedBy: createdBy ? Number.parseInt(createdBy) : null,
      })
      .returning()
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
      .where(
        and(
          eq(activationPins.pinCode, pinCode),
          eq(activationPins.status, "available"),
          eq(activationPins.isUsed, false),
        ),
      )
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
        status: "used",
        isUsed: true,
        usedBy: Number.parseInt(usedBy),
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
      .where(eq(commissions.userId, Number.parseInt(userId)))
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

export async function getAllPins() {
  try {
    const allPins = await db.select().from(activationPins).orderBy(desc(activationPins.createdAt))
    return allPins
  } catch (error) {
    console.error("Error getting all pins:", error)
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

export async function createPayment(paymentData: any) {
  try {
    const [payment] = await db.insert(payments).values(paymentData).returning()
    return { success: true, payment }
  } catch (error) {
    console.error("Error creating payment:", error)
    return { success: false, error: "Failed to create payment" }
  }
}

export async function getPaymentByReference(reference: string) {
  try {
    const [payment] = await db.select().from(payments).where(eq(payments.reference, reference))
    return payment
  } catch (error) {
    console.error("Error getting payment by reference:", error)
    return null
  }
}

export async function updatePaymentStatus(reference: string, status: string) {
  try {
    const [payment] = await db
      .update(payments)
      .set({ status, updatedAt: new Date() })
      .where(eq(payments.reference, reference))
      .returning()
    return { success: true, payment }
  } catch (error) {
    console.error("Error updating payment status:", error)
    return { success: false, error: "Failed to update payment status" }
  }
}

export async function createStockist(stockistData: any) {
  try {
    const [stockist] = await db.insert(stockists).values(stockistData).returning()
    return { success: true, stockist }
  } catch (error) {
    console.error("Error creating stockist:", error)
    return { success: false, error: "Failed to create stockist" }
  }
}

export async function getAllStockists() {
  try {
    const allStockists = await db.select().from(stockists).orderBy(desc(stockists.createdAt))
    return allStockists
  } catch (error) {
    console.error("Error getting all stockists:", error)
    return []
  }
}

export async function updateStockistStatus(id: number, status: string) {
  try {
    const [stockist] = await db
      .update(stockists)
      .set({ status, updatedAt: new Date() })
      .where(eq(stockists.id, id))
      .returning()
    return { success: true, stockist }
  } catch (error) {
    console.error("Error updating stockist status:", error)
    return { success: false, error: "Failed to update stockist status" }
  }
}

export async function getAdminStats() {
  try {
    const [totalUsersResult] = await db.select({ count: count() }).from(users)
    const [activeUsersResult] = await db.select({ count: count() }).from(users).where(eq(users.isActive, true))
    const [totalEarningsResult] = await db.select({ total: sum(users.totalEarnings) }).from(users)
    const [unusedPinsResult] = await db
      .select({ count: count() })
      .from(activationPins)
      .where(eq(activationPins.isUsed, false))
    const [totalPaymentsResult] = await db
      .select({ total: sum(payments.amount) })
      .from(payments)
      .where(eq(payments.status, "completed"))
    const [totalCommissionsResult] = await db
      .select({ total: sum(commissions.amount) })
      .from(commissions)
      .where(eq(commissions.status, "approved"))

    return {
      totalUsers: totalUsersResult.count || 0,
      activeUsers: activeUsersResult.count || 0,
      totalEarnings: totalEarningsResult.total || "0.00",
      unusedPins: unusedPinsResult.count || 0,
      totalPayments: totalPaymentsResult.total || "0.00",
      totalCommissions: totalCommissionsResult.total || "0.00",
    }
  } catch (error) {
    console.error("Error getting admin stats:", error)
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalEarnings: "0.00",
      unusedPins: 0,
      totalPayments: "0.00",
      totalCommissions: "0.00",
    }
  }
}

// Export database connection for direct queries
export { sql }
