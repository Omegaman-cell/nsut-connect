import { createRemoteJWKSet, jwtVerify } from 'jose'

const googleKeys = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'))

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

// Verify Google's signature, issuer, audience and expiry, then the campus
// domain. The button's `hd` option is only a UI hint, not access control.
export async function verifyGoogle(credential, clientId, nonce, keys = googleKeys) {
  if (!clientId) throw new ApiError(503, 'Google sign-in is not configured.')
  if (!nonce || typeof credential !== 'string' || credential.length > 16000) throw new ApiError(401, 'Reload the sign-in page and try again.')
  let identity
  try {
    identity = (await jwtVerify(credential, keys, {
      audience: clientId,
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
      algorithms: ['RS256'],
      requiredClaims: ['sub', 'iat', 'exp', 'nonce'],
      maxTokenAge: '10m',
    })).payload
  } catch {
    throw new ApiError(401, 'Google could not verify this sign-in. Please try again.')
  }
  if (identity.nonce !== nonce) throw new ApiError(401, 'Reload the sign-in page and try again.')
  const email = String(identity.email || '').toLowerCase()
  if (identity.email_verified !== true || identity.hd !== 'nsut.ac.in' || !/^[^@\s]+@nsut\.ac\.in$/.test(email)) throw new ApiError(403, 'Use your verified @nsut.ac.in Google account.')
  return { sub: identity.sub, email, name: String(identity.name || email.split('@')[0]).slice(0, 80) }
}

export function roleFor(email, adminEmails = '') {
  const admins = adminEmails.split(',').map((value) => value.trim().toLowerCase()).filter(Boolean)
  return admins.includes(email.toLowerCase()) ? 'admin' : 'student'
}

export function loginRole(email, adminEmails, requestedRole = 'student') {
  if (!['student', 'admin'].includes(requestedRole)) throw new ApiError(400, 'Choose Student or Admin.')
  if (requestedRole === 'admin' && roleFor(email, adminEmails) !== 'admin') throw new ApiError(403, 'This account does not have admin access. Choose Student to sign in.')
  return requestedRole
}

export function randomToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function tokenHash(token) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function cookie(request, name) {
  return (request.headers.get('Cookie') || '').split(';').map((part) => part.trim()).find((part) => part.startsWith(name + '='))?.slice(name.length + 1) || ''
}

export function cookieHeader(request, name, value, seconds) {
  return `${name}=${value}; Path=/api; HttpOnly; SameSite=Strict; Max-Age=${seconds}${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}`
}

export function checkOrigin(request, siteOrigin) {
  if (request.headers.get('Origin') !== (siteOrigin || new URL(request.url).origin) || request.headers.get('Sec-Fetch-Site') === 'cross-site') throw new ApiError(403, 'This request must come from NSUT Connect.')
}
