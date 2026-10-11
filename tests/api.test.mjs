import test from 'node:test'
import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import { readFileSync } from 'node:fs'
import { handleApi } from '../server/api.js'
import { tokenHash } from '../server/auth.js'

// Use SQLite's actual SQL engine as a small D1-compatible test adapter.
const sqlite = new DatabaseSync(':memory:')
sqlite.exec('PRAGMA foreign_keys = ON')
sqlite.exec(readFileSync(new URL('../drizzle/0000_natural_fenris.sql', import.meta.url), 'utf8'))
function statement(sql, args = []) {
  const query = sqlite.prepare(sql)
  return {
    bind(...values) { return statement(sql, values) },
    async first() { return query.get(...args) || null },
    async all() { return { results: query.all(...args) } },
    async run() {
      const result = query.run(...args)
      return { meta: { changes: Number(result.changes), last_row_id: Number(result.lastInsertRowid) } }
    },
  }
}
const env = { DB: { prepare: statement, batch: (items) => Promise.all(items.map((item) => item.all().catch(() => item.run()))) }, ADMIN_EMAILS: 'admin@nsut.ac.in' }
const studentToken = 'a'.repeat(64)
const otherToken = 'b'.repeat(64)
const adminToken = 'c'.repeat(64)
for (const [id, email, token] of [[1, 'student@nsut.ac.in', studentToken], [2, 'other@nsut.ac.in', otherToken], [3, 'admin@nsut.ac.in', adminToken]]) {
  sqlite.prepare('INSERT INTO users (id,google_sub,email,name) VALUES (?,?,?,?)').run(id, 'google-' + id, email, email.split('@')[0])
  sqlite.prepare('INSERT INTO sessions (token_hash,user_id,expires) VALUES (?,?,?)').run(await tokenHash(token), id, Math.floor(Date.now() / 1000) + 3600)
}
async function api(path, method = 'GET', body, token = studentToken) {
  const response = await handleApi(new Request('https://campus.test/api' + path, {
    method, headers: { Origin: 'https://campus.test', 'Content-Type': 'application/json', Cookie: 'nsut_session=' + token },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }), env)
  return { status: response.status, data: await response.json(), response }
}

test('API persists posts, replies, likes and saved posts, and checks ownership', async () => {
  const created = await api('/posts', 'POST', { title: 'Study group', content: 'Meet in the library after class.', category: 'Academics' })
  assert.equal(created.status, 201)
  const id = created.data.id
  const liked = await api(`/posts/${id}/like`, 'POST')
  assert.deepEqual(liked.data.liked_by, [1])
  assert.equal(liked.data.likes, 1)
  const reply = await api(`/posts/${id}/comments`, 'POST', { content: 'I can join.' }, otherToken)
  assert.equal(reply.data.comments[0].author, 'other')
  await api(`/posts/${id}/save`, 'POST')
  assert.ok((await api('/me')).data.saved.includes(id))
  assert.equal((await api(`/posts/${id}`, 'DELETE', undefined, otherToken)).status, 403)
  assert.equal((await api(`/posts/${id}`, 'DELETE')).status, 200)
  assert.ok(!(await api('/me')).data.saved.includes(id))
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM comments WHERE post_id = ?').get(id).n, 0)
})
test('announcement writes require a server-configured administrator', async () => {
  const body = { title: 'Library hours', content: 'The library closes at eight today.', category: 'Campus', is_pinned: false }
  assert.equal((await api('/announcements', 'POST', body)).status, 403)
  const created = await api('/announcements', 'POST', body, adminToken)
  assert.equal(created.status, 201)
  assert.equal((await api(`/announcements/${created.data.id}/pin`, 'POST', undefined, adminToken)).data.is_pinned, true)
  assert.equal((await api(`/announcements/${created.data.id}`, 'DELETE', undefined, adminToken)).status, 200)
})
test('profile validation and corrected timetable data work through the API', async () => {
  assert.equal((await api('/me', 'PATCH', { name: 'Classmate', bio: '', branch: 'CSE', semester: '1' })).status, 200)
  assert.equal((await api('/me', 'PATCH', { name: 'Classmate', bio: '', branch: 'CSE', semester: '99' })).status, 400)
  const table = (await api('/timetable')).data.CSE['1']
  assert.ok(table.some((entry) => entry.day === 'Monday' && entry.section === '1' && entry.time.startsWith('08:00')))
})
test('logout invalidates the server session; browser storage cannot restore it', async () => {
  assert.equal((await api('/auth/logout', 'POST')).status, 200)
  assert.equal((await api('/me')).status, 401)
})
test('expired sessions are rejected', async () => {
  sqlite.prepare('UPDATE sessions SET expires = 0 WHERE user_id = 2').run()
  assert.equal((await api('/posts', 'GET', undefined, otherToken)).status, 401)
})
