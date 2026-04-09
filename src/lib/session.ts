// Edge + Node compatible — uses Web Crypto API (available in Next.js 14 / Node 18+)

const SECRET = () => process.env.SESSION_SECRET || 'shelfy-change-this-secret-in-prod'

async function getKey(secret: string) {
  return crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']
  )
}

export async function createSession(payload: Record<string, unknown>): Promise<string> {
  const data = JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })
  const key = await getKey(SECRET())
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  const sigHex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
  return btoa(unescape(encodeURIComponent(data))) + '.' + sigHex
}

export async function verifySession(token: string): Promise<Record<string, unknown> | null> {
  try {
    const dot = token.lastIndexOf('.')
    const dataB64 = token.slice(0, dot)
    const sigHex  = token.slice(dot + 1)
    const data = decodeURIComponent(escape(atob(dataB64)))
    const key = await getKey(SECRET())
    const sigBytes = new Uint8Array((sigHex.match(/.{2}/g) || []).map(b => parseInt(b, 16)))
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(data))
    if (!valid) return null
    const payload = JSON.parse(data) as Record<string, unknown>
    if ((payload.exp as number) < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password + SECRET())
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}
