import test from 'node:test'
import assert from 'node:assert/strict'
import { generateKeyPair, SignJWT } from 'jose'
import { verifyGoogle, roleFor, checkOrigin, cookieHeader } from '../server/auth.js'
import { handleApi } from '../server/api.js'

const { privateKey, publicKey } = await generateKeyPair('RS256')
const clientId = 'campus.apps.googleusercontent.com'
const nonce = 'test-login-nonce'
async function token(claims = {}, key = privateKey) {
  return new SignJWT({ email: 'student@nsut.ac.in', email_verified: true, hd: 'nsut.ac.in', nonce, ...claims })
    .setProtectedHeader({ alg: 'RS256' }).setSubject('google-student').setAudience(clientId)
    .setIssuer('https://accounts.google.com').setIssuedAt().setExpirationTime('5m').sign(key)
}
const verify = (credential, n = nonce) => verifyGoogle(credential, clientId, n, publicKey)

test('accepts a signed campus account and uses its Google profile name', async () => {
  const identity = await verify(await token({ name: 'Campus Student' }))
  assert.equal(identity.email, 'student@nsut.ac.in')
  assert.equal(identity.name, 'Campus Student')
})
test('rejects personal email, lookalike domains, unverified email and missing campus claim', async () => {
  for (const claims of [{ email: 'student@gmail.com' }, { email: 'student@nsut.ac.in.evil.com' }, { email_verified: false }, { hd: undefined }, { hd: 'other.ac.in' }]) {
    await assert.rejects(() => token(claims).then(verify), { status: 403 })
  }
})
test('rejects a different audience, issuer, expired token, nonce and forged signature', async () => {
  const base = { email: 'student@nsut.ac.in', email_verified: true, hd: 'nsut.ac.in', nonce }
  for (const [audience, issuer, expires] of [[ 'other', 'https://accounts.google.com', '5m' ], [ clientId, 'https://evil.com', '5m' ], [ clientId, 'https://accounts.google.com', '-1m' ]]) {
    const credential = await new SignJWT(base).setProtectedHeader({ alg: 'RS256' }).setSubject('google-student').setIssuedAt().setAudience(audience).setIssuer(issuer).setExpirationTime(expires).sign(privateKey)
    await assert.rejects(() => verify(credential), { status: 401 })
  }
  await assert.rejects(() => token().then((credential) => verify(credential, 'different')), { status: 401 })
  const forged = await generateKeyPair('RS256')
  await assert.rejects(() => token({}, forged.privateKey).then(verify), { status: 401 })
})
test('roles come only from the server allowlist', () => {
  assert.equal(roleFor('admin@nsut.ac.in'), 'student')
  assert.equal(roleFor('student@nsut.ac.in', 'admin@nsut.ac.in'), 'student')
  assert.equal(roleFor('ADMIN@nsut.ac.in', 'admin@nsut.ac.in'), 'admin')
})
test('rejects cross-site writes and uses secure HttpOnly cookies on HTTPS', () => {
  const request = new Request('https://campus.test/api/posts', { method: 'POST', headers: { Origin: 'https://evil.test' } })
  assert.throws(() => checkOrigin(request), { status: 403 })
  assert.match(cookieHeader(request, 'nsut_session', 'token', 86400), /HttpOnly; SameSite=Strict; Max-Age=86400; Secure/)
})
test('public APIs never accept a demo account or a client-provided role', async () => {
  const env = { DB: {}, GOOGLE_CLIENT_ID: clientId }
  const demo = await handleApi(new Request('https://campus.test/api/auth/demo', { method: 'POST', headers: { Origin: 'https://campus.test' } }), env)
  assert.equal(demo.status, 403)
  const anonymous = await handleApi(new Request('https://campus.test/api/posts', { headers: { Authorization: 'Bearer demo' } }), env)
  assert.equal(anonymous.status, 401)
})
