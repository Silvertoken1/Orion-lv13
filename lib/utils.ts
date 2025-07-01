import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generatePinCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function generateMemberId(): string {
  const prefix = "BO"
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `${prefix}${timestamp}${random}`
}

export function generateTrackingNumber(): string {
  const prefix = "TRK"
  const timestamp = Date.now().toString()
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `${prefix}${timestamp}${random}`
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

export function calculateCommission(amount: number, level: number): number {
  const rates = {
    1: 0.1, // 10% for direct referrals
    2: 0.05, // 5% for second level
    3: 0.03, // 3% for third level
    4: 0.02, // 2% for fourth level
    5: 0.01, // 1% for fifth level
  }
  return amount * (rates[level as keyof typeof rates] || 0)
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^(\+234|0)[789][01]\d{8}$/
  return phoneRegex.test(phone)
}

export function generateReferralCode(name: string): string {
  const cleanName = name.replace(/[^a-zA-Z]/g, "").toUpperCase()
  const namePrefix = cleanName.slice(0, 3)
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `${namePrefix}${random}`
}

export function calculateMatrixPosition(totalUsers: number): { level: number; position: number } {
  let level = 1
  let usersInLevel = 2
  let totalUsersUpToLevel = 2

  while (totalUsers > totalUsersUpToLevel) {
    level++
    usersInLevel *= 2
    totalUsersUpToLevel += usersInLevel
  }

  const position = totalUsers - (totalUsersUpToLevel - usersInLevel)
  return { level, position }
}
