import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { pgTable, serial, varchar, text, timestamp, decimal, boolean, integer, jsonb } from "drizzle-orm/pg-core"
import { eq, desc, count, sum } from "drizzle-orm"

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql)

// Database Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  memberId: varchar("member_id", { length: 20 }).unique().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  address: text("address"),
  sponsorId: varchar("sponsor_id", { length: 20 }),
  uplineId: varchar("upline_id", { length: 20 }),
  role: varchar("role", { length: 20 }).default("user"),
  status: varchar("status", { length: 20 }).default("active"),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default("0"),
  availableBalance: decimal("available_balance", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const activationPins = pgTable("activation_pins", {
  id: serial("id").primaryKey(),
  pinCode: varchar("pin_code", { length: 20 }).unique().notNull(),
  isUsed: boolean("is_used").default(false),
  usedBy: varchar("used_by", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow(),
  usedAt: timestamp("used_at"),
})

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 20 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  reference: varchar("reference", { length: 100 }).unique(),
  trackingNumber: varchar("tracking_number", { length: 50 }),
  paymentMethod: varchar("payment_method", { length: 50 }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const commissions = pgTable("commissions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 20 }).notNull(),
  fromUserId: varchar("from_user_id", { length: 20 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  level: integer("level").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
})

export const stockists = pgTable("stockists", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 20 }).notNull(),
  businessName: varchar("business_name", { length: 255 }).notNull(),
  businessAddress: text("business_address").notNull(),
  businessPhone: varchar("business_phone", { length: 20 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  stockLevel: integer("stock_level").default(0),
  totalSales: decimal("total_sales", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Database Functions
export async function createUser(userData: any) {
  return await db.insert(users).values(userData).returning()
}

export async function getUserByEmail(email: string) {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1)
  return result[0] || null
}

export async function getUserByMemberId(memberId: string) {
  const result = await db.select().from(users).where(eq(users.memberId, memberId)).limit(1)
  return result[0] || null
}

export async function getAllUsers() {
  return await db.select().from(users).orderBy(desc(users.createdAt))
}

export async function createActivationPin(pinCode: string) {
  return await db.insert(activationPins).values({ pinCode }).returning()
}

export async function getActivationPin(pinCode: string) {
  const result = await db.select().from(activationPins).where(eq(activationPins.pinCode, pinCode)).limit(1)
  return result[0] || null
}

export async function useActivationPin(pinCode: string, usedBy: string) {
  return await db
    .update(activationPins)
    .set({ isUsed: true, usedBy, usedAt: new Date() })
    .where(eq(activationPins.pinCode, pinCode))
    .returning()
}

export async function createPayment(paymentData: any) {
  return await db.insert(payments).values(paymentData).returning()
}

export async function getPaymentByReference(reference: string) {
  const result = await db.select().from(payments).where(eq(payments.reference, reference)).limit(1)
  return result[0] || null
}

export async function updatePaymentStatus(reference: string, status: string) {
  return await db
    .update(payments)
    .set({ status, updatedAt: new Date() })
    .where(eq(payments.reference, reference))
    .returning()
}

export async function createCommission(commissionData: any) {
  return await db.insert(commissions).values(commissionData).returning()
}

export async function getUserCommissions(userId: string) {
  return await db.select().from(commissions).where(eq(commissions.userId, userId)).orderBy(desc(commissions.createdAt))
}

export async function getAdminStats() {
  const totalUsers = await db.select({ count: count() }).from(users)
  const totalPayments = await db
    .select({ sum: sum(payments.amount) })
    .from(payments)
    .where(eq(payments.status, "completed"))
  const totalCommissions = await db
    .select({ sum: sum(commissions.amount) })
    .from(commissions)
    .where(eq(commissions.status, "approved"))

  return {
    totalUsers: totalUsers[0]?.count || 0,
    totalPayments: totalPayments[0]?.sum || "0",
    totalCommissions: totalCommissions[0]?.sum || "0",
  }
}

export async function createStockist(stockistData: any) {
  return await db.insert(stockists).values(stockistData).returning()
}

export async function getAllStockists() {
  return await db.select().from(stockists).orderBy(desc(stockists.createdAt))
}

export async function updateStockistStatus(id: number, status: string) {
  return await db.update(stockists).set({ status, updatedAt: new Date() }).where(eq(stockists.id, id)).returning()
}

// Export database connection for direct queries
export { sql }
