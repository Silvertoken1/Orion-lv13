import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import * as schema from "./schema"

// Create the database connection
const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })

// Export all schema items
export const {
  users,
  activationPins,
  payments,
  commissions,
  systemSettings,
  stockists,
  stockTransactions,
  stockRequests,
} = schema

// Export types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type ActivationPin = typeof activationPins.$inferSelect
export type NewActivationPin = typeof activationPins.$inferInsert
export type Payment = typeof payments.$inferSelect
export type NewPayment = typeof payments.$inferInsert
export type Commission = typeof commissions.$inferSelect
export type NewCommission = typeof commissions.$inferInsert

// Legacy compatibility function
export async function getDatabase() {
  return db
}
