import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'

const ADMIN_PATHS = ['/dashboard', '/campaigns', '/clients', '/screens', '/media', '/schedule', '/reports', '/debug']
const PORTAL_PATH = '/portal/'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ─── حماية لوحة التحكم ─────────────────────────
  if (ADMIN_PATHS.some(p => pathname.startsWith(p))) {
    const cookie = req.cookies.get('shelfy_admin')?.value
    if (!cookie) return NextResponse.redirect(new URL('/admin-login', req.url))
    const session = await verifySession(cookie)
    if (!session || session.role !== 'admin') {
      const res = NextResponse.redirect(new URL('/admin-login', req.url))
      res.cookies.delete('shelfy_admin')
      return res
    }
  }

  // ─── حماية بوابة العملاء ───────────────────────
  if (pathname.startsWith(PORTAL_PATH)) {
    const token = pathname.split('/')[2]
    if (!token) return NextResponse.redirect(new URL('/#login', req.url))

    const cookie = req.cookies.get('shelfy_client')?.value
    if (!cookie) return NextResponse.redirect(new URL(`/portal-login?token=${token}`, req.url))

    const session = await verifySession(cookie)
    if (!session || session.token !== token) {
      const res = NextResponse.redirect(new URL(`/portal-login?token=${token}`, req.url))
      res.cookies.delete('shelfy_client')
      return res
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/campaigns/:path*',
    '/clients/:path*',
    '/screens/:path*',
    '/media/:path*',
    '/schedule/:path*',
    '/reports/:path*',
    '/debug/:path*',
    '/portal/:path*',
  ],
}
