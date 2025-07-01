import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { pgTable, serial, varchar, text, timestamp, decimal } from "drizzle-orm/pg-core";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);

// System Settings Configuration
export const systemSettings = {
  registrationEnabled: true,
  minPasswordLength: 8,
  activationRequired: true,
  defaultUserRole: "member",
};

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
});

// Helper Functions
export async function getDatabase() {
  return db;
}
