import { sql } from "drizzle-orm"
import { integer, sqliteTable, text, real } from "drizzle-orm/sqlite-core"

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  memberId: text("member_id").unique().notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").unique().notNull(),
  phone: text("phone").notNull(),
  passwordHash: text("password_hash").notNull(),
  sponsorId: integer("sponsor_id").references(() => users.id),
  uplineId: integer("upline_id").references(() => users.id),
  location: text("location"),
  status: text("status").notNull().default("pending"), // pending, active, suspended
  role: text("role").notNull().default("user"), // user, admin
  activationDate: integer("activation_date", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
})

export const activationPins = sqliteTable("activation_pins", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pinCode: text("pin_code").unique().notNull(),
  status: text("status").notNull().default("available"), // available, used, expired
  createdBy: integer("created_by").references(() => users.id),
  usedBy: integer("used_by").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  usedAt: integer("used_at", { mode: "timestamp" }),
})

export const payments = sqliteTable("payments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  amount: real("amount").notNull(),
  paymentMethod: text("payment_method").notNull(), // card, transfer, cash
  paymentReference: text("payment_reference"),
  trackingNumber: text("tracking_number"),
  status: text("status").notNull().default("pending"), // pending, confirmed, failed
  confirmedAt: integer("confirmed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
})

export const matrixPositions = sqliteTable("matrix_positions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  level: integer("level").notNull(),
  position: integer("position").notNull(),
  parentId: integer("parent_id").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
})

export const commissions = sqliteTable("commissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  fromUserId: integer("from_user_id")
    .references(() => users.id)
    .notNull(),
  amount: real("amount").notNull(),
  level: integer("level").notNull(),
  commissionType: text("commission_type").notNull(), // referral, matrix, bonus
  status: text("status").notNull().default("pending"), // pending, approved, paid
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: integer("approved_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
})

export const systemSettings = sqliteTable("system_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  settingKey: text("setting_key").unique().notNull(),
  settingValue: text("setting_value").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
})

export const withdrawals = sqliteTable("withdrawals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  amount: real("amount").notNull(),
  bankName: text("bank_name").notNull(),
  accountNumber: text("account_number").notNull(),
  accountName: text("account_name").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, paid, rejected
  processedBy: integer("processed_by").references(() => users.id),
  processedAt: integer("processed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
})
