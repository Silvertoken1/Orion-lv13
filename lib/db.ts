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

interface Database {
  users: User[]
  pins: Pin[]
  nextUserId: number
  nextPinId: number
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

      // Ensure counters exist
      if (!db.nextUserId) db.nextUserId = 1
      if (!db.nextPinId) db.nextPinId = 1

      return db
    }
  } catch (error) {
    console.error("Error reading database:", error)
  }

  // Return default database structure
  return {
    users: [],
    pins: [],
    nextUserId: 1,
    nextPinId: 1,
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
  return db.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null
}

export async function getUserById(id: number): Promise<User | null> {
  const db = getDatabase()
  return db.users.find((user) => user.id === id) || null
}

export async function getUserByMemberId(memberId: string): Promise<User | null> {
  const db = getDatabase()
  return db.users.find((user) => user.memberId.toLowerCase() === memberId.toLowerCase()) || null
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

// Initialize database with default admin user
export async function initializeDatabase(): Promise<void> {
  const db = getDatabase()

  // Check if admin user exists
  const adminEmail = process.env.ADMIN_EMAIL || "admin@brightorian.com"
  const adminExists = db.users.find((user) => user.email.toLowerCase() === adminEmail.toLowerCase())

  if (!adminExists) {
    try {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin123", 12)

      const adminUser: User = {
        id: db.nextUserId++,
        memberId: "BO000001",
        firstName: "Admin",
        lastName: "User",
        email: adminEmail,
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
    } catch (error) {
      console.error("Error initializing database:", error)
      throw error
    }
  }
}

export async function validateUserCredentials(email: string, password: string): Promise<User | null> {
  const db = getDatabase()
  const user = db.users.find((user) => user.email.toLowerCase() === email.toLowerCase())

  if (!user) {
    console.log(`User not found for email: ${email}`)
    return null
  }

  try {
    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    if (!isValidPassword) {
      console.log(`Invalid password for user: ${email}`)
      return null
    }

    return user
  } catch (error) {
    console.error("Error validating password:", error)
    return null
  }
}

export type { User, Pin }
