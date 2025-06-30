import { NextResponse } from "next/server"
import type { NextRequest } from "next/request"

// Simple JWT verification without jose dependency
function verifyToken(token: string): any {
  try {
    // Simple base64 decode for development - replace with proper JWT verification in production
    const payload = token.split(".")[1]
    if (!payload) return null

    const decoded = JSON.parse(atob(payload))

    // Check if token is expired
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return null
    }

    return decoded
  } catch (error) {
    return null
  }
}

export async function middleware(request: NextRequest) {
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
    "/setup",
  ]

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  if (isPublicRoute) {
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

  // Check stockist routes
  if (pathname.startsWith("/stockist") && payload.role !== "stockist") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)",
  ],
}
