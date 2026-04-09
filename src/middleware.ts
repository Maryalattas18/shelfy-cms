import { NextRequest, NextResponse } from 'next/server'

// Cache the key per isolate instance for performance
let cachedKey: CryptoKey | null = null

async function getKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey
  const secret = process.env.SESSION_SECRET || 'shelfy-change-this-secret-in-prod'
  cachedKey = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']
  )
  return cachedKey
}

async function isValidSession(token: string, requiredRole?: string, requiredPortalToken?: string): Promise<boolean> {
  try {
    const dot = token.lastIndexOf('.')
    if (dot === -1) return false
    const dataB64 = token.slice(0, dot)
    const sigHex  = token.slice(dot + 1)
    const data    = decodeURIComponent(escape(atob(dataB64)))
    const key     = await getKey()
    const sigBytes = new Uint8Array((sigHex.match(/.{2}/g) || []).map(b => parseInt(b, 16)))
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(data))
    if (!valid) return false
    const payload = JSON.parse(data)
    if (payload.exp < Date.now()) return false
    if (requiredRole && payload.role !== requiredRole) return false
    if (requiredPortalToken && payload.token !== requiredPortalToken) return false
    return true
  } catch {
    return false
  }
}

const ADMIN_PATHS = ['/dashboard', '/campaigns', '/clients', '/screens', '/media', '/schedule', '/reports']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ─── حماية لوحة التحكم ─────────────────────────
  if (ADMIN_PATHS.some(p => pathname.startsWith(p))) {
    const cookie = req.cookies.get('shelfy_admin')?.value
    const valid = cookie ? await isValidSession(cookie, 'admin') : false
    if (!valid) {
      const res = NextResponse.redirect(new URL('/admin-login', req.url))
      if (cookie) res.cookies.delete('shelfy_admin')
      return res
    }
  }

  // ─── حماية بوابة العملاء ───────────────────────
  if (pathname.startsWith('/portal/') && !pathname.startsWith('/portal-login')) {
    const token = pathname.split('/')[2]
    if (!token) return NextResponse.redirect(new URL('/#login', req.url))
    const cookie = req.cookies.get('shelfy_client')?.value
    const valid = cookie ? await isValidSession(cookie, undefined, token) : false
    if (!valid) {
      const res = NextResponse.redirect(new URL(`/portal-login?token=${token}`, req.url))
      if (cookie) res.cookies.delete('shelfy_client')
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
    '/portal/:path*',
  ],
}
