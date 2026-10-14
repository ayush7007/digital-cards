import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function proxy(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    // ✅ NextAuth v5 uses different cookie name
    cookieName: process.env.NODE_ENV === 'production'
      ? '__Secure-authjs.session-token'
      : 'authjs.session-token',
  })

  console.log('🍪 Proxy token:', token ? 'FOUND' : 'NOT FOUND')
  console.log('🌐 Path:', req.nextUrl.pathname)

  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')

  if (isAdminRoute && !token) {
    console.log('🚫 Redirecting to login — no token')
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
