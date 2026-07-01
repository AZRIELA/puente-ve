import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/test-gate', '/api/']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

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
