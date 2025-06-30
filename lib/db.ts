// database.ts
import fs from "fs"
import path from "path"
import bcrypt from "bcryptjs"

const DB_FILE = path.join(process.cwd(), "data", "database.json")

interface User {
  id: number
  memberId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  passwordHash: string
  sponsorId?: string
  uplineId?: string
  location?: string
  status: "pending" | "active" | "suspended"
  role: "user" | "admin" | "stockist"
  activationDate?: string
  totalEarnings: number
  availableBalance: number
  totalReferrals: number
  createdAt: string
  updatedAt: string
}

interface Pin {
  id: number
  pinCode: string
  status: "available" | "used" | "expired"
  createdBy: number
  usedBy?: number
  createdAt: string
  usedAt?: string
}

interface Stockist {
  id: number
  userId: number
  businessName: string
  businessAddress: string
  businessPhone: string
  businessEmail: string
  licenseNumber?: string
  bankName: string
  accountNumber: string
  accountName: string
  status: "pending" | "approved" | "suspended"
  approvedBy?: number
  approvedAt?: string
  totalSales: number
  totalCommission: number
  availableStock: number
  createdAt: string
  updatedAt: string
}

interface StockTransaction {
  id: number
  stockistId: number
  type: "purchase" | "sale" | "return"
  quantity: number
  unitPrice: number
  totalAmount: number
  commission: number
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  notes?: string
  createdAt: string
}

interface Commission {
  id: number
  userId: number
  fromUserId: number
  amount: number
  level: number
  type: "referral" | "matrix"
  status: "pending" | "approved" | "paid"
  createdAt: string
  approvedAt?: string
}

interface Payment {
  id: number
  userId: number
  amount: number
  type: "registration" | "withdrawal" | "stock_purchase"
  status: "pending" | "completed" | "failed"
  reference: string
  createdAt: string
  completedAt?: string
}

interface Database {
  users: User[]
  pins: Pin[]
  stockists: Stockist[]
  stockTransactions: StockTransaction[]
  commissions: Commission[]
  payments: Payment[]
  nextUserId: number
  nextPinId: number
  nextStockistId: number
  nextTransactionId: number
  nextCommissionId: number
  nextPaymentId: number
}

function ensureDataDirectory() {
  const dataDir = path.dirname(DB_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

function getDatabase(): Database {
  ensureDataDirectory()

  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf8")
      const db = JSON.parse(data)

      if (!db.users) db.users = []
      if (!db.pins) db.pins = []
      if (!db.stockists) db.stockists = []
      if (!db.stockTransactions) db.stockTransactions = []
      if (!db.commissions) db.commissions = []
      if (!db.payments) db.payments = []

      if (!db.nextUserId) db.nextUserId = 1
      if (!db.nextPinId) db.nextPinId = 1
      if (!db.nextStockistId) db.nextStockistId = 1
      if (!db.nextTransactionId) db.nextTransactionId = 1
      if (!db.nextCommissionId) db.nextCommissionId = 1
      if (!db.nextPaymentId) db.nextPaymentId = 1

      return db
    }
  } catch (error) {
    console.error("Error reading database:", error)
  }

  return {
    users: [],
    pins: [],
    stockists: [],
    stockTransactions: [],
    commissions: [],
    payments: [],
    nextUserId: 1,
    nextPinId: 1,
    nextStockistId: 1,
    nextTransactionId: 1,
    nextCommissionId: 1,
    nextPaymentId: 1,
  }
}

function saveDatabase(db: Database): void {
  ensureDataDirectory()
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2))
  } catch (error) {
    console.error("Error saving database:", error)
    throw error
  }
}

// Utility export
export { getDatabase, saveDatabase }

// Export types for use elsewhere
export type {
  User,
  Pin,
  Stockist,
  StockTransaction,
  Commission,
  Payment,
  Database
} from './types'
