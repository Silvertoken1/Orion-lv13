import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export async function hashPassword(password: string): Promise<string> {
  try {
    const saltRounds = 12
    return await bcrypt.hash(password, saltRounds)
  } catch (error) {
    console.error("Error hashing password:", error)
    throw new Error("Failed to hash password")
  }
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashedPassword)
  } catch (error) {
    console.error("Error verifying password:", error)
    return false
  }
}

export function generateToken(payload: any): string {
  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
  } catch (error) {
    console.error("Error generating token:", error)
    throw new Error("Failed to generate token")
  }
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    console.error("Error verifying token:", error)
    return null
  }
}
