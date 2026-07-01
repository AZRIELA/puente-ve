import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// El middleware corre en el edge — no tiene acceso a sessionStorage (browser only).
// La protección real se hace en el cliente (layout). Aquí solo bloqueamos
// rutas de API si no hay entorno de producción sin clave configurada.
// Para el gate de testers, usamos un cookie liviano seteado desde el cliente.

const PUBLIC_PATHS = ['/test-gate', '/api/']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rutas siempre públicas
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Si NEXT_PUBLIC_TEST_CODE está configurada, verificar cookie de acceso
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
