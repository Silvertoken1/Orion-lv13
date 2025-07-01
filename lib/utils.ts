import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateMemberId(): string {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `BO${timestamp}${random}`
}

export function generateTrackingNumber(): string {
  const timestamp = Date.now().toString()
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `TRK${timestamp}${random}`
}

export function generateActivationPin(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? Number.parseFloat(amount) : amount
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(num)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d)
}

export function calculateCommission(amount: number, level: number): number {
  const commissionRates = [0.3, 0.1, 0.05, 0.03, 0.02, 0.01] // 30%, 10%, 5%, 3%, 2%, 1%
  const rate = commissionRates[level - 1] || 0
  return amount * rate
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^(\+234|0)[789][01]\d{8}$/
  return phoneRegex.test(phone)
}

export function generateReference(): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000)
  return `BO_${timestamp}_${random}`
}
