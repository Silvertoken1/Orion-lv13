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

      // Ensure all arrays exist
      if (!db.users) db.users = []
      if (!db.pins) db.pins = []
      if (!db.stockists) db.stockists = []
      if (!db.stockTransactions) db.stockTransactions = []
      if (!db.commissions) db.commissions = []
      if (!db.payments) db.payments = []

      // Ensure counters exist
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

  // Return default database structure
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

// User functions
export async function createUser(
  userData: Omit<User, "id" | "createdAt" | "updatedAt" | "totalEarnings" | "availableBalance" | "totalReferrals">,
): Promise<User> {
  const db = getDatabase()
  const now = new Date().toISOString()

  const newUser: User = {
    ...userData,
    id: db.nextUserId++,
    totalEarnings: 0,
    availableBalance: 0,
    totalReferrals: 0,
    createdAt: now,
    updatedAt: now,
  }

  db.users.push(newUser)
  saveDatabase(db)
  return newUser
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = getDatabase()
  return db.users.find((user) => user.email === email) || null
}

export async function getUserById(id: number): Promise<User | null> {
  const db = getDatabase()
  return db.users.find((user) => user.id === id) || null
}

export async function getUserByMemberId(memberId: string): Promise<User | null> {
  const db = getDatabase()
  return db.users.find((user) => user.memberId === memberId) || null
}

export async function getAllUsers(): Promise<User[]> {
  const db = getDatabase()
  return db.users
}

export async function updateUser(id: number, updates: Partial<User>): Promise<User | null> {
  const db = getDatabase()
  const userIndex = db.users.findIndex((user) => user.id === id)

  if (userIndex === -1) return null

  db.users[userIndex] = {
    ...db.users[userIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  saveDatabase(db)
  return db.users[userIndex]
}

// PIN functions
export async function createPin(pinCode: string, createdBy: number): Promise<Pin> {
  const db = getDatabase()
  const now = new Date().toISOString()

  const newPin: Pin = {
    id: db.nextPinId++,
    pinCode,
    status: "available",
    createdBy,
    createdAt: now,
  }

  db.pins.push(newPin)
  saveDatabase(db)
  return newPin
}

export async function getPinByCode(pinCode: string): Promise<Pin | null> {
  const db = getDatabase()
  return db.pins.find((pin) => pin.pinCode === pinCode) || null
}

export async function usePin(pinCode: string, usedBy: number): Promise<boolean> {
  const db = getDatabase()
  const pinIndex = db.pins.findIndex((pin) => pin.pinCode === pinCode && pin.status === "available")

  if (pinIndex === -1) return false

  db.pins[pinIndex].status = "used"
  db.pins[pinIndex].usedBy = usedBy
  db.pins[pinIndex].usedAt = new Date().toISOString()

  saveDatabase(db)
  return true
}

export async function getAllPins(): Promise<Pin[]> {
  const db = getDatabase()
  return db.pins
}

// Stockist functions
export async function createStockist(
  stockistData: Omit<Stockist, "id" | "createdAt" | "updatedAt" | "totalSales" | "totalCommission" | "availableStock">,
): Promise<Stockist> {
  const db = getDatabase()
  const now = new Date().toISOString()

  const newStockist: Stockist = {
    ...stockistData,
    id: db.nextStockistId++,
    totalSales: 0,
    totalCommission: 0,
    availableStock: 0,
    createdAt: now,
    updatedAt: now,
  }

  db.stockists.push(newStockist)
  saveDatabase(db)
  return newStockist
}

export async function getStockistByUserId(userId: number): Promise<Stockist | null> {
  const db = getDatabase()
  return db.stockists.find((stockist) => stockist.userId === userId) || null
}

export async function getAllStockists(): Promise<Stockist[]> {
  const db = getDatabase()
  return db.stockists
}

export async function updateStockist(id: number, updates: Partial<Stockist>): Promise<Stockist | null> {
  const db = getDatabase()
  const stockistIndex = db.stockists.findIndex((stockist) => stockist.id === id)

  if (stockistIndex === -1) return null

  db.stockists[stockistIndex] = {
    ...db.stockists[stockistIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  saveDatabase(db)
  return db.stockists[stockistIndex]
}

// Stock Transaction functions
export async function createStockTransaction(
  transactionData: Omit<StockTransaction, "id" | "createdAt">,
): Promise<StockTransaction> {
  const db = getDatabase()
  const now = new Date().toISOString()

  const newTransaction: StockTransaction = {
    ...transactionData,
    id: db.nextTransactionId++,
    createdAt: now,
  }

  db.stockTransactions.push(newTransaction)

  // Update stockist's available stock and totals
  const stockist = db.stockists.find((s) => s.id === transactionData.stockistId)
  if (stockist) {
    if (transactionData.type === "purchase") {
      stockist.availableStock += transactionData.quantity
    } else if (transactionData.type === "sale") {
      stockist.availableStock -= transactionData.quantity
      stockist.totalSales += transactionData.totalAmount
      stockist.totalCommission += transactionData.commission
    }
    stockist.updatedAt = now
  }

  saveDatabase(db)
  return newTransaction
}

export async function getStockTransactionsByStockistId(stockistId: number): Promise<StockTransaction[]> {
  const db = getDatabase()
  return db.stockTransactions.filter((transaction) => transaction.stockistId === stockistId)
}

// Commission functions
export async function createCommission(commissionData: Omit<Commission, "id" | "createdAt">): Promise<Commission> {
  const db = getDatabase()
  const now = new Date().toISOString()

  const newCommission: Commission = {
    ...commissionData,
    id: db.nextCommissionId++,
    createdAt: now,
  }

  db.commissions.push(newCommission)
  saveDatabase(db)
  return newCommission
}

export async function getUserCommissions(userId: number): Promise<Commission[]> {
  const db = getDatabase()
  return db.commissions.filter((commission) => commission.userId === userId)
}

export async function getAllCommissions(): Promise<Commission[]> {
  const db = getDatabase()
  return db.commissions
}

// Payment functions
export async function createPayment(paymentData: Omit<Payment, "id" | "createdAt">): Promise<Payment> {
  const db = getDatabase()
  const now = new Date().toISOString()

  const newPayment: Payment = {
    ...paymentData,
    id: db.nextPaymentId++,
    createdAt: now,
  }

  db.payments.push(newPayment)
  saveDatabase(db)
  return newPayment
}

export async function getUserPayments(userId: number): Promise<Payment[]> {
  const db = getDatabase()
  return db.payments.filter((payment) => payment.userId === userId)
}

export async function getAllPayments(): Promise<Payment[]> {
  const db = getDatabase()
  return db.payments
}

// Initialize database with default admin user
export async function initializeDatabase(): Promise<void> {
  const db = getDatabase()

  // Check if admin user exists
  const adminExists = db.users.find((user) => user.email === (process.env.ADMIN_EMAIL || "admin@brightorian.com"))

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin123", 10)

    const adminUser: User = {
      id: db.nextUserId++,
      memberId: "BO000001",
      firstName: "Admin",
      lastName: "User",
      email: process.env.ADMIN_EMAIL || "admin@brightorian.com",
      phone: process.env.ADMIN_PHONE || "+2348000000000",
      passwordHash: hashedPassword,
      status: "active",
      role: "admin",
      activationDate: new Date().toISOString(),
      totalEarnings: 0,
      availableBalance: 0,
      totalReferrals: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    db.users.push(adminUser)

    // Create some sample PINs
    const samplePins = ["PIN123456", "PIN123457", "PIN123458", "PIN123459", "PIN123460"]
    for (const pinCode of samplePins) {
      const pin: Pin = {
        id: db.nextPinId++,
        pinCode,
        status: "available",
        createdBy: adminUser.id,
        createdAt: new Date().toISOString(),
      }
      db.pins.push(pin)
    }

    saveDatabase(db)
    console.log("Database initialized with admin user and sample PINs")
  }
}

export type { User, Pin, Stockist, StockTransaction, Commission, Payment }
