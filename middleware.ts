import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value

  // Protected routes
  const protectedRoutes = ["/dashboard", "/admin", "/profile", "/stockist/dashboard"]
  const adminRoutes = ["/admin"]
  const authRoutes = ["/auth/login", "/auth/register"]
  const stockistRoutes = ["/stockist/dashboard"]

  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some((route) => request.nextUrl.pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => request.nextUrl.pathname.startsWith(route))
  const isStockistRoute = stockistRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // Handle protected routes
  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    // Simple token validation without jose dependency
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))

      // Check if token is expired
      if (payload.exp && payload.exp < Date.now() / 1000) {
        const response = NextResponse.redirect(new URL("/auth/login", request.url))
        response.cookies.delete("auth-token")
        return response
      }

      // Check admin access
      if (isAdminRoute && payload.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }

      // Check stockist access
      if (isStockistRoute && payload.role !== "stockist" && payload.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    } catch (error) {
      const response = NextResponse.redirect(new URL("/auth/login", request.url))
      response.cookies.delete("auth-token")
      return response
    }
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))

      if (payload.role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url))
      } else if (payload.role === "stockist") {
        return NextResponse.redirect(new URL("/stockist/dashboard", request.url))
      } else {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    } catch (error) {
      // Invalid token, allow access to auth pages
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
}
