// The hosted submission is a frontend demo. Local development uses FastAPI.
const hostedDemo = !['localhost', '127.0.0.1'].includes(location.hostname)
export const isHostedDemo = hostedDemo
const KEY = 'nsut-connect-demo-v1'
let demoData
export const session = () => {
  try {
    return JSON.parse(localStorage.getItem('nsut-session') || 'null')
  } catch {
    return null
  }
}
export function storeSession(value) {
  if (value) localStorage.setItem('nsut-session', JSON.stringify(value))
  else localStorage.removeItem('nsut-session')
}
const id = (items) => Math.max(0, ...items.map((i) => i.id)) + 1
async function demo(path, method, body) {
  if (!demoData) {
    try {
      demoData = JSON.parse(localStorage.getItem(KEY))
    } catch {
      /* start with seed */
    }
    if (!demoData) {
      const response = await fetch('/seed.json')
      if (!response.ok)
        throw new Error('Could not load the campus demo. Please refresh.')
      demoData = await response.json()
      demoData.users.forEach((u) =>
        Object.assign(u, {
          branch: 'CSE',
          semester: '1',
          bio: 'Part of the NSUT community.',
          saved: [],
        }),
      )
      demoData.posts.forEach((p) =>
        Object.assign(p, { comments: [], liked_by: [] }),
      )
      demoData.announcements.forEach(
        (a) => (a.category = a.is_pinned ? 'Academics' : 'Campus'),
      )
    }
  }
  // Update reference data without deleting the user's posts or saved items.
  if (demoData.timetable_version !== 2) {
    const response = await fetch('/seed.json')
    if (!response.ok)
      throw new Error('Could not update the timetable. Please refresh.')
    const seed = await response.json()
    demoData.timetables = seed.timetables
    demoData.timetable_version = 2
  }
  for (const account of demoData.users) {
    if (
      account.email === 'student@nsut.ac.in' &&
      ['Yash Sharma', 'Benjamin Netanyahu'].includes(account.name)
    ) {
      account.name = 'Student'
      account.bio = ''
    }
  }
  const save = () => localStorage.setItem(KEY, JSON.stringify(demoData))
  const user = demoData.users.find((u) => u.email === session()?.user.email)
  const find = (items, n) => {
    const item = items.find((i) => i.id === Number(n))
    if (!item) throw new Error('This item could not be found.')
    return item
  }
  if (path === '/config') return { demo: true, google_client_id: '' }
  if (path === '/health') return { status: 'Online', mode: 'browser-demo' }
  if (path === '/auth/demo') {
    if (!['student@nsut.ac.in', 'admin@nsut.ac.in'].includes(body.email))
      throw new Error('Use one of the listed demo accounts.')
    return {
      token: 'demo',
      user: demoData.users.find((u) => u.email === body.email),
    }
  }
  if (path === '/auth/logout') return { ok: true }
  if (!user) throw new Error('Please sign in again.')
  let result
  if (path === '/me') {
    if (method === 'PATCH') {
      if (!demoData.timetables[body.branch]?.[body.semester])
        throw new Error('Choose an available branch and semester.')
      if (body.name.trim().length < 2) throw new Error('Add your name.')
      Object.assign(user, body)
    }
    result = user
  } else if (path === '/timetable') result = demoData.timetables
  else if (path === '/posts') {
    if (method === 'POST') {
      if (body.title.trim().length < 3 || body.content.trim().length < 3)
        throw new Error('Add a title and message with at least 3 characters.')
      result = {
        ...body,
        id: id(demoData.posts),
        author: user.name,
        author_email: user.email,
        created_at: new Date().toISOString(),
        likes: 0,
        liked_by: [],
        comments: [],
      }
      demoData.posts.push(result)
    } else result = [...demoData.posts].sort((a, b) => b.id - a.id)
  } else if (path.startsWith('/posts/')) {
    const [, , n, action] = path.split('/')
    const post = find(demoData.posts, n)
    if (method === 'DELETE') {
      if (post.author_email !== user.email && user.role !== 'admin')
        throw new Error('You can only remove your own posts.')
      demoData.posts = demoData.posts.filter((p) => p.id !== post.id)
      result = { ok: true }
    } else if (action === 'like') {
      const liked = post.liked_by.includes(user.id)
      post.liked_by = liked
        ? post.liked_by.filter((i) => i !== user.id)
        : [...post.liked_by, user.id]
      post.likes += liked ? -1 : 1
      result = post
    } else if (action === 'save') {
      user.saved = user.saved.includes(post.id)
        ? user.saved.filter((i) => i !== post.id)
        : [...user.saved, post.id]
      result = user
    } else if (action === 'comments') {
      if (!body.content.trim()) throw new Error('Write a reply first.')
      post.comments.push({
        id: id(post.comments),
        author: user.name,
        content: body.content.trim(),
        created_at: new Date().toISOString(),
      })
      result = post
    }
  } else if (path === '/announcements') {
    if (method === 'POST') {
      if (user.role !== 'admin')
        throw new Error('Only administrators can manage announcements.')
      result = {
        ...body,
        id: id(demoData.announcements),
        posted_by: user.name,
        created_at: new Date().toISOString(),
      }
      demoData.announcements.push(result)
    } else
      result = [...demoData.announcements].sort(
        (a, b) => Number(b.is_pinned) - Number(a.is_pinned) || b.id - a.id,
      )
  } else if (path.startsWith('/announcements/')) {
    if (user.role !== 'admin')
      throw new Error('Only administrators can manage announcements.')
    const item = find(demoData.announcements, path.split('/')[2])
    if (method === 'DELETE') {
      demoData.announcements = demoData.announcements.filter(
        (a) => a.id !== item.id,
      )
      result = { ok: true }
    } else {
      Object.assign(item, body)
      result = item
    }
  }
  if (result === undefined) throw new Error('This action is unavailable.')
  save()
  return structuredClone(result)
}
export async function api(path, method = 'GET', body) {
  if (hostedDemo) return demo(path, method, body)
  let response
  try {
    response = await fetch('/api' + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(session() ? { Authorization: 'Bearer ' + session().token } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
  } catch {
    throw new Error(
      'Cannot reach the campus server. Start the backend and try again.',
    )
  }
  let result
  try {
    result = await response.json()
  } catch {
    throw new Error(
      'The campus server is unavailable. Start the backend and try again.',
    )
  }
  if (!response.ok) {
    if (response.status === 401) {
      storeSession(null)
      window.dispatchEvent(new Event('session-expired'))
    }
    const error = new Error(
      typeof result.detail === 'string'
        ? result.detail
        : 'Check the form fields and try again.',
    )
    error.status = response.status
    throw error
  }
  return result
}
