import { sql } from "drizzle-orm"
import { integer, pgTable, text, timestamp, decimal } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  memberId: text("member_id").unique().notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").unique().notNull(),
  phone: text("phone").notNull(),
  passwordHash: text("password_hash").notNull(),
  sponsorId: text("sponsor_id"),
  uplineId: text("upline_id"),
  location: text("location"),
  status: text("status").notNull().default("pending"),
  role: text("role").notNull().default("user"),
  activationDate: timestamp("activation_date"),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default("0"),
  availableBalance: decimal("available_balance", { precision: 10, scale: 2 }).default("0"),
  totalReferrals: integer("total_referrals").default(0),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
})

export const activationPins = pgTable("activation_pins", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  pinCode: text("pin_code").unique().notNull(),
  status: text("status").notNull().default("available"),
  createdBy: integer("created_by").references(() => users.id),
  usedBy: integer("used_by").references(() => users.id),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  usedAt: timestamp("used_at"),
})

export const payments = pgTable("payments", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  paymentReference: text("payment_reference"),
  trackingNumber: text("tracking_number"),
  status: text("status").notNull().default("pending"),
  confirmedAt: timestamp("confirmed_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
})

export const commissions = pgTable("commissions", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  fromUserId: integer("from_user_id")
    .references(() => users.id)
    .notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  level: integer("level").notNull(),
  commissionType: text("commission_type").notNull(),
  status: text("status").notNull().default("pending"),
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
})

export const withdrawals = pgTable("withdrawals", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  bankName: text("bank_name").notNull(),
  accountNumber: text("account_number").notNull(),
  accountName: text("account_name").notNull(),
  status: text("status").notNull().default("pending"),
  processedBy: integer("processed_by").references(() => users.id),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
})
