import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'fallback-secret-for-dev-1234567890'

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

export async function signToken(payload: object): Promise<string> {
  // Convert payload to base64url
  const data = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
  
  const encoder = new TextEncoder()
  const key = await getCryptoKey(JWT_SECRET)
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(data)
  )
  
  const signatureArray = Array.from(new Uint8Array(signatureBuffer))
  const signature = btoa(String.fromCharCode.apply(null, signatureArray))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
    
  return `${data}.${signature}`
}

export async function verifyToken(token: string): Promise<any> {
  try {
    const [data, signature] = token.split('.')
    if (!data || !signature) return null
    
    const key = await getCryptoKey(JWT_SECRET)
    const encoder = new TextEncoder()
    
    // Decode base64url signature back to array buffer
    const signatureStr = signature.replace(/-/g, '+').replace(/_/g, '/')
    const signatureBinary = atob(signatureStr)
    const signatureBytes = new Uint8Array(signatureBinary.length)
    for (let i = 0; i < signatureBinary.length; i++) {
      signatureBytes[i] = signatureBinary.charCodeAt(i)
    }
    
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      encoder.encode(data)
    )
    
    if (!isValid) return null
    
    const decodedData = atob(data.replace(/-/g, '+').replace(/_/g, '/'))
    const payload = JSON.parse(decodedData)
    
    if (payload.exp && Date.now() > payload.exp) return null
    return payload
  } catch {
    return null
  }
}

export async function getCurrentUser(req: NextRequest): Promise<{ userId: string; email: string; role: string; name: string } | null> {
  const cookie = req.cookies.get('admin-session')
  if (!cookie) return null
  const payload = await verifyToken(cookie.value)
  if (!payload || !payload.userId) return null
  return {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    name: payload.name ?? 'Usuario',
  }
}

export async function verifyAdminRequest(req: NextRequest): Promise<boolean> {
  const user = await getCurrentUser(req)
  return !!(user && (user.role === 'admin' || user.role === 'operator'))
}
