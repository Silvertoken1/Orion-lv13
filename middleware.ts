import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET || "your-fallback-secret-key"

function parseJWT(token: string) {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const payload = parts[1]
    const decoded = Buffer.from(payload, "base64url").toString("utf8")
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/auth/login",
    "/auth/register",
    "/about",
    "/contact",
    "/shop",
    "/locations",
    "/team",
    "/payment/success",
    "/payment/verify",
    "/api/auth/login",
    "/api/auth/register",
    "/api/payment",
    "/api/init",
    "/setup",
  ]

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Get token from cookie
  const token = request.cookies.get("auth-token")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // Parse JWT token
  const payload = parseJWT(token)

  if (!payload) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // Check if token is expired
  if (payload.exp && payload.exp < Date.now() / 1000) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // Admin route protection
  if (pathname.startsWith("/admin")) {
    if (payload.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  // Stockist route protection
  if (pathname.startsWith("/stockist")) {
    if (payload.role !== "stockist") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
}
