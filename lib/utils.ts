import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Password hashing using Web Crypto API (works in both Node.js and browsers)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  return hashHex
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const hashedInput = await hashPassword(password)
  return hashedInput === hashedPassword
}

// Generate member ID
export function generateMemberId(): string {
  const prefix = "BO"
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substring(2, 4).toUpperCase()
  return `${prefix}${timestamp}${random}`
}

// Generate PIN code
export function generatePinCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Generate tracking number
export function generateTrackingNumber(): string {
  const prefix = "TRK"
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}${timestamp}${random}`
}

// Validate email
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate phone number (Nigerian format)
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^(\+234|234|0)?[789][01]\d{8}$/
  return phoneRegex.test(phone.replace(/\s+/g, ""))
}

// Format currency
export function formatCurrency(amount: number | string, currency = "NGN"): string {
  const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
  }).format(numAmount)
}

// Format date
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return dateObj.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Format date and time
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return dateObj.toLocaleString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Calculate commission based on level
export function calculateCommission(amount: number, level: number): number {
  const commissionRates = {
    1: 0.1, // 10% for level 1
    2: 0.05, // 5% for level 2
    3: 0.03, // 3% for level 3
    4: 0.02, // 2% for level 4
    5: 0.01, // 1% for level 5
    6: 0.005, // 0.5% for level 6
  }

  const rate = commissionRates[level as keyof typeof commissionRates] || 0
  return amount * rate
}

// Generate referral link
export function generateReferralLink(memberId: string, baseUrl = ""): string {
  const url = baseUrl || (typeof window !== "undefined" ? window.location.origin : "")
  return `${url}/auth/register?ref=${memberId}`
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

// Generate random string
export function generateRandomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Sleep function for delays
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Check if string is valid JSON
export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)
}

// Capitalize first letter
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Convert string to slug
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-")
}

// Deep clone object
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

// Check if object is empty
export function isEmpty(obj: any): boolean {
  if (obj == null) return true
  if (Array.isArray(obj) || typeof obj === "string") return obj.length === 0
  return Object.keys(obj).length === 0
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout
  return ((...args: any[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }) as T
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
  let inThrottle: boolean
  return ((...args: any[]) => {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }) as T
}
