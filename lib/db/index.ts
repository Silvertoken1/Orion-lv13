import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { pgTable, text, integer, timestamp, boolean, decimal, serial } from "drizzle-orm/pg-core"
import { eq, and, desc, sql } from "drizzle-orm"

// Database connection
const connectionString = process.env.DATABASE_URL!
const sql_client = neon(connectionString)
export const db = drizzle(sql_client)

// Database schemas
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  memberId: text("member_id").unique().notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").unique().notNull(),
  phone: text("phone").notNull(),
  password: text("password").notNull(),
  sponsorId: text("sponsor_id"),
  uplineId: text("upline_id"),
  role: text("role").default("user"),
  status: text("status").default("active"),
  isActivated: boolean("is_activated").default(false),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default("0.00"),
  availableBalance: decimal("available_balance", { precision: 10, scale: 2 }).default("0.00"),
  totalReferrals: integer("total_referrals").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const activationPins = pgTable("activation_pins", {
  id: serial("id").primaryKey(),
  pin: text("pin").unique().notNull(),
  isUsed: boolean("is_used").default(false),
  usedBy: text("used_by"),
  createdAt: timestamp("created_at").defaultNow(),
  usedAt: timestamp("used_at"),
})

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  memberId: text("member_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  reference: text("reference").unique().notNull(),
  status: text("status").default("pending"),
  paymentMethod: text("payment_method").default("paystack"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const commissions = pgTable("commissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  memberId: text("member_id").notNull(),
  fromUserId: integer("from_user_id").references(() => users.id),
  fromMemberId: text("from_member_id").notNull(),
  level: integer("level").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
  status: text("status").default("pending"),
  paymentId: integer("payment_id").references(() => payments.id),
  createdAt: timestamp("created_at").defaultNow(),
})

export const stockists = pgTable("stockists", {
  id: serial("id").primaryKey(),
  businessName: text("business_name").notNull(),
  ownerName: text("owner_name").notNull(),
  email: text("email").unique().notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  password: text("password").notNull(),
  status: text("status").default("pending"),
  stockLevel: integer("stock_level").default(0),
  totalSales: decimal("total_sales", { precision: 10, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const stockTransactions = pgTable("stock_transactions", {
  id: serial("id").primaryKey(),
  stockistId: integer("stockist_id").references(() => stockists.id),
  type: text("type").notNull(), // 'sale', 'restock', 'request'
  quantity: integer("quantity").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  notes: text("notes"),
  status: text("status").default("completed"),
  createdAt: timestamp("created_at").defaultNow(),
})

// Database functions
export async function getDatabase() {
  return db
}

export async function createUser(userData: {
  memberId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  sponsorId?: string
  uplineId?: string
  role?: string
}) {
  const [user] = await db.insert(users).values(userData).returning()
  return user
}

export async function getUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email))
  return user
}

export async function getUserByMemberId(memberId: string) {
  const [user] = await db.select().from(users).where(eq(users.memberId, memberId))
  return user
}

export async function updateUser(memberId: string, updates: any) {
  const [user] = await db.update(users).set(updates).where(eq(users.memberId, memberId)).returning()
  return user
}

export async function createActivationPin(pin: string) {
  const [pinRecord] = await db.insert(activationPins).values({ pin }).returning()
  return pinRecord
}

export async function useActivationPin(pin: string, memberId: string) {
  const [pinRecord] = await db
    .update(activationPins)
    .set({ isUsed: true, usedBy: memberId, usedAt: new Date() })
    .where(and(eq(activationPins.pin, pin), eq(activationPins.isUsed, false)))
    .returning()
  return pinRecord
}

export async function getUnusedPin(pin: string) {
  const [pinRecord] = await db
    .select()
    .from(activationPins)
    .where(and(eq(activationPins.pin, pin), eq(activationPins.isUsed, false)))
  return pinRecord
}

export async function createPayment(paymentData: {
  userId: number
  memberId: string
  amount: string
  reference: string
  status?: string
  paymentMethod?: string
  metadata?: string
}) {
  const [payment] = await db.insert(payments).values(paymentData).returning()
  return payment
}

export async function updatePayment(reference: string, updates: any) {
  const [payment] = await db.update(payments).set(updates).where(eq(payments.reference, reference)).returning()
  return payment
}

export async function createCommission(commissionData: {
  userId: number
  memberId: string
  fromUserId: number
  fromMemberId: string
  level: number
  amount: string
  percentage: string
  paymentId?: number
}) {
  const [commission] = await db.insert(commissions).values(commissionData).returning()
  return commission
}

export async function getAllUsers() {
  return await db.select().from(users).orderBy(desc(users.createdAt))
}

export async function getActiveUsers() {
  return await db.select().from(users).where(eq(users.status, "active")).orderBy(desc(users.createdAt))
}

export async function getUserStats() {
  const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users)
  const activeUsers = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.status, "active"))
  const totalPayments = await db
    .select({ sum: sql<number>`sum(${payments.amount})` })
    .from(payments)
    .where(eq(payments.status, "completed"))
  const totalCommissions = await db.select({ sum: sql<number>`sum(${commissions.amount})` }).from(commissions)

  return {
    totalUsers: totalUsers[0]?.count || 0,
    activeUsers: activeUsers[0]?.count || 0,
    totalPayments: totalPayments[0]?.sum || 0,
    totalCommissions: totalCommissions[0]?.sum || 0,
  }
}
