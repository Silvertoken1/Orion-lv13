import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET || "your-fallback-secret-key"

function verifyToken(token: string): any {
  try {
    const [header, payload, signature] = token.split(".")
    if (!header || !payload || !signature) {
      return null
    }

    // Simple verification - in production use proper JWT library
    const expectedSignature = btoa(`${header}.${payload}.${JWT_SECRET}`)
    if (signature !== expectedSignature) {
      return null
    }

    return JSON.parse(atob(payload))
  } catch (error) {
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
    "/api/auth/login",
    "/api/auth/register",
    "/api/init",
    "/api/payment/verify",
    "/payment/success",
  ]

  // Check if the route is public
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Get token from cookies
  const token = request.cookies.get("auth-token")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // Verify token
  const payload = verifyToken(token)
  if (!payload) {
    const response = NextResponse.redirect(new URL("/auth/login", request.url))
    response.cookies.delete("auth-token")
    return response
  }

  // Check admin routes
  if (pathname.startsWith("/admin") && payload.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Check user routes
  if (pathname.startsWith("/dashboard") && !payload.memberId) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
}
