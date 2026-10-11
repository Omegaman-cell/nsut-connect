import { ApiError, verifyGoogle, roleFor, loginRole, randomToken, tokenHash, cookie, cookieHeader, checkOrigin } from './auth.js'
import seed from './seed.json' with { type: 'json' }

const categories = ['Academics', 'Events', 'Hackathons', 'Campus', 'Opportunities']
const now = () => new Date().toISOString()
const seconds = () => Math.floor(Date.now() / 1000)

function json(value, status = 200, cookies = []) {
  const headers = new Headers({ 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' })
  for (const value of cookies) headers.append('Set-Cookie', value)
  return new Response(JSON.stringify(value), { status, headers })
}
function text(value, label, min, max) {
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max) throw new ApiError(400, `${label} must have ${min}–${max} characters.`)
  return value.trim()
}
function postFields(body) {
  if (!categories.includes(body.category)) throw new ApiError(400, 'Choose an available category.')
  return [text(body.title, 'Title', 3, 140), text(body.content, 'Message', 3, 4000), body.category]
}
function noticeFields(body) {
  if (typeof body.is_pinned !== 'boolean') throw new ApiError(400, 'Choose whether to pin the announcement.')
  return [...postFields(body), body.is_pinned ? 1 : 0]
}
function requireAdmin(user) {
  if (user.role !== 'admin') throw new ApiError(403, 'Only administrators can manage announcements.')
}

// Sample discussions/notices are inserted once; no sample accounts are created.
// Tables are created by migrations, never by request handlers.
async function seedData(db) {
  if (await db.prepare("SELECT value FROM settings WHERE key = 'seed-v1'").first()) return
  const statements = seed.posts.map((post) => db.prepare('INSERT OR IGNORE INTO posts (id,title,content,category,author,author_email,created_at,sample_likes) VALUES (?,?,?,?,?,?,?,?)').bind(post.id, post.title, post.content, post.category, post.author, post.author_email, post.created_at, post.likes || 0))
  for (const item of seed.announcements) statements.push(db.prepare('INSERT OR IGNORE INTO announcements (id,title,content,category,created_at,is_pinned) VALUES (?,?,?,?,?,?)').bind(item.id, item.title, item.content, item.category || (item.is_pinned ? 'Academics' : 'Campus'), item.created_at, item.is_pinned ? 1 : 0))
  statements.push(db.prepare("INSERT OR IGNORE INTO settings (key,value) VALUES ('seed-v1','done')"))
  await db.batch(statements)
}
async function profile(db, row, adminEmails) {
  const saved = await db.prepare('SELECT post_id FROM saved WHERE user_id = ?').bind(row.id).all()
  const { google_sub, session_role, ...publicUser } = row
  const role = session_role === 'admin' ? roleFor(row.email, adminEmails) : 'student'
  return { ...publicUser, role, saved: saved.results.map((item) => item.post_id) }
}
async function currentUser(request, env) {
  const token = cookie(request, 'nsut_session')
  if (!/^[a-f0-9]{64}$/.test(token)) throw new ApiError(401, 'Please sign in with your campus account.')
  const row = await env.DB.prepare('SELECT users.*, sessions.role AS session_role FROM sessions JOIN users ON sessions.user_id = users.id WHERE sessions.token_hash = ? AND sessions.expires > ?').bind(await tokenHash(token), seconds()).first()
  if (!row) throw new ApiError(401, 'Your session has expired. Please sign in again.')
  return profile(env.DB, row, env.ADMIN_EMAILS)
}
async function allPosts(db) {
  const [posts, comments, likes] = await db.batch([db.prepare('SELECT * FROM posts ORDER BY id DESC'), db.prepare('SELECT * FROM comments ORDER BY id'), db.prepare('SELECT * FROM likes')])
  return posts.results.map(({ sample_likes, ...post }) => {
    const liked_by = likes.results.filter((like) => like.post_id === post.id).map((like) => like.user_id)
    return { ...post, likes: sample_likes + liked_by.length, liked_by, comments: comments.results.filter((comment) => comment.post_id === post.id) }
  })
}
async function getPost(db, id) {
  const post = (await allPosts(db)).find((post) => post.id === id)
  if (!post) throw new ApiError(404, 'This post could not be found.')
  return post
}
async function bodyJson(request) {
  if (!request.headers.get('Content-Type')?.startsWith('application/json')) throw new ApiError(415, 'Use a JSON request.')
  const raw = await request.text()
  if (raw.length > 20000) throw new ApiError(413, 'This request is too large.')
  try {
    const body = JSON.parse(raw)
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error()
    return body
  } catch { throw new ApiError(400, 'Check the submitted form and try again.') }
}

async function route(request, env) {
  const path = new URL(request.url).pathname.replace(/^\/api/, '').replace(/\/$/, '') || '/'
  const method = request.method
  if (method !== 'GET') checkOrigin(request, env.SITE_ORIGIN)
  if (path === '/health' && method === 'GET') return json({ status: 'Online', mode: 'campus-google', application: 'NSUT Connect' })
  if (!env.DB) throw new ApiError(503, 'The campus server is temporarily unavailable.')
  const db = env.DB
  if (path === '/config' && method === 'GET') {
    const nonce = randomToken()
    await db.batch([db.prepare('DELETE FROM login_nonces WHERE expires < ?').bind(seconds()), db.prepare('INSERT INTO login_nonces (nonce,expires) VALUES (?,?)').bind(nonce, seconds() + 600)])
    return json({ google_client_id: env.GOOGLE_CLIENT_ID || '', demo: false, nonce }, 200, [cookieHeader(request, 'nsut_login', nonce, 600)])
  }
  if (path === '/auth/demo') throw new ApiError(403, 'Use your @nsut.ac.in Google account.')
  if (path === '/auth/google' && method === 'POST') {
    const body = await bodyJson(request)
    const nonce = cookie(request, 'nsut_login')
    const identity = await verifyGoogle(body.credential, env.GOOGLE_CLIENT_ID, nonce)
    const role = loginRole(identity.email, env.ADMIN_EMAILS, body.role)
    const consumed = await db.prepare('DELETE FROM login_nonces WHERE nonce = ? AND expires > ?').bind(nonce, seconds()).run()
    if (consumed.meta.changes !== 1) throw new ApiError(401, 'Reload the sign-in page and try again.')
    await db.prepare('INSERT INTO users (google_sub,email,name) VALUES (?,?,?) ON CONFLICT(google_sub) DO UPDATE SET email = excluded.email').bind(identity.sub, identity.email, identity.name).run()
    const user = await db.prepare('SELECT * FROM users WHERE google_sub = ?').bind(identity.sub).first()
    const token = randomToken()
    await db.batch([db.prepare('DELETE FROM sessions WHERE expires < ?').bind(seconds()), db.prepare('INSERT INTO sessions (token_hash,user_id,expires,role) VALUES (?,?,?,?)').bind(await tokenHash(token), user.id, seconds() + 86400, role)])
    return json({ user: await profile(db, { ...user, session_role: role }, env.ADMIN_EMAILS), token: 'cookie' }, 200, [cookieHeader(request, 'nsut_session', token, 86400), cookieHeader(request, 'nsut_login', '', 0)])
  }
  if (path === '/auth/logout' && method === 'POST') {
    await db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await tokenHash(cookie(request, 'nsut_session'))).run()
    return json({ ok: true }, 200, [cookieHeader(request, 'nsut_session', '', 0)])
  }

  const user = await currentUser(request, env)
  await seedData(db)
  if (path === '/me' && method === 'GET') return json(user)
  if (path === '/me' && method === 'PATCH') {
    const body = await bodyJson(request)
    const name = text(body.name, 'Name', 2, 80)
    const bio = text(body.bio, 'Bio', 0, 280)
    if (!seed.timetables[body.branch]?.[body.semester]) throw new ApiError(400, 'Choose an available branch and semester.')
    await db.prepare('UPDATE users SET name = ?,bio = ?,branch = ?,semester = ? WHERE id = ?').bind(name, bio, body.branch, body.semester, user.id).run()
    return json({ ...user, name, bio, branch: body.branch, semester: body.semester })
  }
  if (path === '/timetable' && method === 'GET') return json(seed.timetables)
  if (path === '/posts' && method === 'GET') return json(await allPosts(db))
  if (path === '/posts' && method === 'POST') {
    const result = await db.prepare('INSERT INTO posts (title,content,category,author,author_email,created_at) VALUES (?,?,?,?,?,?)').bind(...postFields(await bodyJson(request)), user.name, user.email, now()).run()
    return json(await getPost(db, result.meta.last_row_id), 201)
  }
  const postRoute = /^\/posts\/(\d+)(?:\/(like|save|comments))?$/.exec(path)
  if (postRoute) {
    const id = Number(postRoute[1])
    const action = postRoute[2]
    const post = await getPost(db, id)
    if (!action && method === 'DELETE') {
      if (post.author_email !== user.email && user.role !== 'admin') throw new ApiError(403, 'You can only remove your own posts.')
      await db.prepare('DELETE FROM posts WHERE id = ?').bind(id).run()
      return json({ ok: true })
    }
    if (action === 'like' && method === 'POST') {
      if (post.liked_by.includes(user.id)) await db.prepare('DELETE FROM likes WHERE post_id = ? AND user_id = ?').bind(id, user.id).run()
      else await db.prepare('INSERT OR IGNORE INTO likes (post_id,user_id) VALUES (?,?)').bind(id, user.id).run()
      return json(await getPost(db, id))
    }
    if (action === 'save' && method === 'POST') {
      if (user.saved.includes(id)) await db.prepare('DELETE FROM saved WHERE post_id = ? AND user_id = ?').bind(id, user.id).run()
      else await db.prepare('INSERT OR IGNORE INTO saved (post_id,user_id) VALUES (?,?)').bind(id, user.id).run()
      return json(await profile(db, { ...(await db.prepare('SELECT * FROM users WHERE id = ?').bind(user.id).first()), session_role: user.role }, env.ADMIN_EMAILS))
    }
    if (action === 'comments' && method === 'POST') {
      const content = text((await bodyJson(request)).content, 'Reply', 1, 2000)
      await db.prepare('INSERT INTO comments (post_id,author,content,created_at) VALUES (?,?,?,?)').bind(id, user.name, content, now()).run()
      return json(await getPost(db, id), 201)
    }
  }
  if (path === '/announcements' && method === 'GET') {
    const rows = await db.prepare('SELECT * FROM announcements ORDER BY is_pinned DESC,id DESC').all()
    return json(rows.results.map((row) => ({ ...row, is_pinned: Boolean(row.is_pinned) })))
  }
  if (path === '/announcements' && method === 'POST') {
    requireAdmin(user)
    const [title, content, category, pinned] = noticeFields(await bodyJson(request))
    const result = await db.prepare('INSERT INTO announcements (title,content,category,is_pinned,created_at) VALUES (?,?,?,?,?)').bind(title, content, category, pinned, now()).run()
    return json({ ...(await db.prepare('SELECT * FROM announcements WHERE id = ?').bind(result.meta.last_row_id).first()), is_pinned: Boolean(pinned) }, 201)
  }
  const noticeRoute = /^\/announcements\/(\d+)(?:\/(pin))?$/.exec(path)
  if (noticeRoute) {
    requireAdmin(user)
    const id = Number(noticeRoute[1])
    const item = await db.prepare('SELECT * FROM announcements WHERE id = ?').bind(id).first()
    if (!item) throw new ApiError(404, 'This announcement could not be found.')
    if (noticeRoute[2] === 'pin' && method === 'POST') {
      await db.prepare('UPDATE announcements SET is_pinned = 1 - is_pinned WHERE id = ?').bind(id).run()
      return json({ ...item, is_pinned: !item.is_pinned })
    }
    if (!noticeRoute[2] && method === 'DELETE') {
      await db.prepare('DELETE FROM announcements WHERE id = ?').bind(id).run()
      return json({ ok: true })
    }
    if (!noticeRoute[2] && method === 'PATCH') {
      const [title, content, category, pinned] = noticeFields(await bodyJson(request))
      await db.prepare('UPDATE announcements SET title = ?,content = ?,category = ?,is_pinned = ? WHERE id = ?').bind(title, content, category, pinned, id).run()
      return json({ ...item, title, content, category, is_pinned: Boolean(pinned) })
    }
  }
  throw new ApiError(404, 'This endpoint could not be found.')
}

export async function handleApi(request, env) {
  try { return await route(request, env) }
  catch (error) {
    if (error instanceof ApiError) return json({ detail: error.message }, error.status)
    console.error('Campus API failed:', error.name)
    return json({ detail: 'The campus server could not complete this request. Please try again.' }, 500)
  }
}
