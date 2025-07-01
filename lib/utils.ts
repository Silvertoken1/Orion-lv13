import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateMemberId(): string {
  const prefix = "BO"
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `${prefix}${timestamp}${random}`
}

export function generatePinCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function generateTrackingNumber(): string {
  const prefix = "TRK"
  const timestamp = Date.now().toString()
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `${prefix}${timestamp}${random}`
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? Number.parseFloat(amount) : amount
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d)
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^(\+234|0)[789][01]\d{8}$/
  return phoneRegex.test(phone)
}

export function calculateCommission(level: number): number {
  const commissionRates = {
    1: 4000,
    2: 2000,
    3: 2000,
    4: 1500,
    5: 1500,
    6: 1500,
  }
  return commissionRates[level as keyof typeof commissionRates] || 0
}

export function getCommissionLevels(): Array<{ level: number; amount: number }> {
  return [
    { level: 1, amount: 4000 },
    { level: 2, amount: 2000 },
    { level: 3, amount: 2000 },
    { level: 4, amount: 1500 },
    { level: 5, amount: 1500 },
    { level: 6, amount: 1500 },
  ]
}

// Hash password using Web Crypto API (works in both Node.js and browsers)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  return hashHex
}

// Verify password using Web Crypto API
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const hashedInput = await hashPassword(password)
  return hashedInput === hashedPassword
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "")
}

export function generateReferralLink(memberId: string, baseUrl: string): string {
  return `${baseUrl}/auth/register?sponsor=${memberId}&upline=${memberId}`
}

export function isValidMemberId(memberId: string): boolean {
  return /^[A-Z0-9]{6,20}$/.test(memberId)
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return "An unknown error occurred"
}
