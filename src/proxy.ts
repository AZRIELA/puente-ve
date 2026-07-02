import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { verifyToken } from '@/lib/auth'

const PUBLIC_PATHS = ['/test-gate', '/api/']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get('admin-session')?.value
    console.log('[DEBUG PROXY] path:', pathname, 'hasCookie:', !!sessionCookie)
    const isValid = sessionCookie ? await verifyToken(sessionCookie) : null
    console.log('[DEBUG PROXY] isValid:', isValid)

    if (!isValid || isValid.role !== 'admin') {
      console.log('[DEBUG PROXY] Unauthorized. Redirecting to /login')
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const testCode = process.env.NEXT_PUBLIC_TEST_CODE
  if (testCode) {
    const hasAccess = request.cookies.get('test-access')?.value === '1'
    if (!hasAccess) {
      return NextResponse.redirect(new URL('/test-gate', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
