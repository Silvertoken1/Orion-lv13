import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET || "your-fallback-secret-key"

function parseJWT(token: string) {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const payload = parts[1]
    const decoded = Buffer.from(payload, "base64").toString("utf-8")
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for public routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/init") ||
    pathname.startsWith("/api/payment/verify") ||
    pathname === "/" ||
    pathname === "/auth/login" ||
    pathname === "/auth/register" ||
    pathname === "/about" ||
    pathname === "/contact" ||
    pathname === "/shop" ||
    pathname === "/locations" ||
    pathname === "/team" ||
    pathname.startsWith("/payment/success") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  const token = request.cookies.get("auth-token")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  const payload = parseJWT(token)
  if (!payload) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // Check if token is expired
  if (payload.exp && payload.exp < Date.now() / 1000) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // Admin route protection
  if (pathname.startsWith("/admin") && payload.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)"],
}
