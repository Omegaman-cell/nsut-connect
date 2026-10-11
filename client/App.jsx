import { useEffect, useRef, useState } from 'react'
import { api, session, storeSession } from './api'
import Icon from './icons'
import { selectedSection } from './timetable'
import {
  categories,
  navigation,
  initialDay,
  date,
  categoryClass,
} from './helpers'
import {
  Avatar,
  Brand,
  Modal,
  Compose,
  PostCard,
  Thread,
  Empty,
} from './components'
import Login from './pages/Login'
import Feed from './pages/Feed'
import Timetable from './pages/Timetable'
import Profile from './pages/Profile'
import ThemeButton from './ThemeButton'
import { initialTheme } from './theme'

// App owns the shared data and passes it to the screens through props.
export default function App() {
  const [theme, setTheme] = useState(initialTheme)
  const [auth, setAuth] = useState(session)
  const [config, setConfig] = useState({ google_client_id: '', demo: false })
  const [page, setPage] = useState(location.hash.slice(1) || 'feed')
  const [posts, setPosts] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [tables, setTables] = useState({})
  const [loading, setLoading] = useState(!!session())
  const [error, setError] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('latest')
  const [query, setQuery] = useState('')
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState('')
  const [mobile, setMobile] = useState(false)
  const [online, setOnline] = useState(navigator.onLine)
  const [read, setRead] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('nsut-read') || '[]')
    } catch {
      return []
    }
  })
  const search = useRef(null)
  const toastTimer = useRef(null)
  const user = auth?.user
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('nsut-theme', theme)
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#111214' : '#f4f5f1')
  }, [theme])
  function toggleTheme() {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }
  function notify(message) {
    setToast(message)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 4000)
  }
  function navigate(value) {
    location.hash = value
    setPage(value)
    setMobile(false)
    setQuery('')
    setCategory('All')
    window.scrollTo({ top: 0 })
  }
  function login(value) {
    storeSession(value)
    setAuth(value)
    setError('')
    navigate('feed')
  }
  function updateUser(value) {
    const next = { ...session(), user: value }
    storeSession(next)
    setAuth(next)
  }
  async function load() {
    setLoading(true)
    setError('')
    try {
      const [me, p, a, t] = await Promise.all([
        api('/me'),
        api('/posts'),
        api('/announcements'),
        api('/timetable'),
      ])
      updateUser(me)
      setPosts(p)
      setAnnouncements(a)
      setTables(t)
      localStorage.setItem('nsut-offline-timetable', JSON.stringify(t))
      localStorage.setItem('nsut-offline-data', JSON.stringify({ p, a }))
    } catch (err) {
      setError(err.message)
      if (!navigator.onLine) {
        try {
          setTables(
            JSON.parse(localStorage.getItem('nsut-offline-timetable') || '{}'),
          )
          const cache = JSON.parse(
            localStorage.getItem('nsut-offline-data') || '{}',
          )
          setPosts(cache.p || [])
          setAnnouncements(cache.a || [])
        } catch {
          /* no cache */
        }
      }
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    api('/config')
      .then(setConfig)
      .catch(() => {})
    const expired = () => {
      setAuth(null)
      setModal(null)
    }
    const hash = () => setPage(location.hash.slice(1) || 'feed')
    const connection = () => setOnline(navigator.onLine)
    const shortcut = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        search.current?.focus()
      }
    }
    window.addEventListener('session-expired', expired)
    window.addEventListener('hashchange', hash)
    window.addEventListener('online', connection)
    window.addEventListener('offline', connection)
    window.addEventListener('keydown', shortcut)
    return () => {
      clearTimeout(toastTimer.current)
      window.removeEventListener('session-expired', expired)
      window.removeEventListener('hashchange', hash)
      window.removeEventListener('online', connection)
      window.removeEventListener('offline', connection)
      window.removeEventListener('keydown', shortcut)
    }
  }, [])
  useEffect(() => {
    if (auth) load()
  }, [auth?.token])
  useEffect(() => {
    const valid = [
      'feed',
      'discussions',
      'announcements',
      'timetable',
      'saved',
      'profile',
      'admin',
    ]
    if (!valid.includes(page) || (page === 'admin' && user?.role !== 'admin')) {
      setPage('feed')
      location.hash = 'feed'
    }
  }, [page, user?.role])
  async function logout() {
    try {
      await api('/auth/logout', 'POST')
    } catch {}
    storeSession(null)
    setAuth(null)
    setModal(null)
    setPosts([])
    setAnnouncements([])
    setRead([])
    localStorage.removeItem('nsut-read')
  }
  async function like(postId) {
    try {
      const p = await api(`/posts/${postId}/like`, 'POST')
      setPosts((items) => items.map((i) => (i.id === p.id ? p : i)))
    } catch (err) {
      notify(err.message)
    }
  }
  async function savePost(postId) {
    try {
      const u = await api(`/posts/${postId}/save`, 'POST')
      updateUser(u)
      notify(
        u.saved.includes(postId) ? 'Post saved.' : 'Removed from saved posts.',
      )
    } catch (err) {
      notify(err.message)
    }
  }
  async function publish(body) {
    if (modal.type === 'announcement') {
      const item = await api(
        modal.item ? `/announcements/${modal.item.id}` : '/announcements',
        modal.item ? 'PATCH' : 'POST',
        body,
      )
      setAnnouncements((items) =>
        [item, ...items.filter((i) => i.id !== item.id)].sort(
          (a, b) => Number(b.is_pinned) - Number(a.is_pinned) || b.id - a.id,
        ),
      )
      notify(modal.item ? 'Announcement updated.' : 'Announcement published.')
    } else {
      const p = await api('/posts', 'POST', body)
      setPosts((items) => [p, ...items])
      setCategory('All')
      notify('Post published.')
    }
    setModal(null)
  }
  async function reply(postId, content) {
    const p = await api(`/posts/${postId}/comments`, 'POST', { content })
    setPosts((items) => items.map((i) => (i.id === p.id ? p : i)))
    notify('Reply posted.')
  }
  async function remove() {
    try {
      await api(
        modal.kind === 'announcement'
          ? `/announcements/${modal.item.id}`
          : `/posts/${modal.item.id}`,
        'DELETE',
      )
      if (modal.kind === 'announcement')
        setAnnouncements((items) => items.filter((i) => i.id !== modal.item.id))
      else {
        setPosts((items) => items.filter((i) => i.id !== modal.item.id))
        updateUser({
          ...user,
          saved: (user.saved || []).filter((id) => id !== modal.item.id),
        })
      }
      setModal(null)
      notify('Removed successfully.')
    } catch (err) {
      notify(err.message)
    }
  }
  function markRead() {
    const ids = announcements.map((a) => a.id)
    setRead(ids)
    localStorage.setItem('nsut-read', JSON.stringify(ids))
    notify('You’re all caught up.')
  }
  const filtered = posts
    .filter(
      (p) =>
        (category === 'All' || p.category === category) &&
        `${p.title} ${p.content} ${p.author}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (page !== 'saved' || user?.saved?.includes(p.id)),
    )
    .sort((a, b) => (sort === 'popular' ? b.likes - a.likes : b.id - a.id))
  const visibleAnnouncements = announcements.filter(
    (a) =>
      (category === 'All' || a.category === category) &&
      `${a.title} ${a.content} ${a.posted_by}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  )
  const thread =
    modal?.type === 'thread' ? posts.find((p) => p.id === modal.id) : null
  const unread = announcements.filter((a) => !read.includes(a.id)).length
  const userClasses = tables[user?.branch]?.[user?.semester] || []
  const userSection = selectedSection(
    user?.id,
    user?.branch,
    user?.semester,
    userClasses,
  )
  const upcoming = userClasses.filter(
    (item) => item.day === initialDay() && item.section === userSection,
  )
  const close = () => setModal(null)
  if (!auth)
    return (
      <Login
        onLogin={login}
        config={config}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    )
  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('main')?.focus()
        }}
      >
        Skip to content
      </a>
      {mobile && (
        <button
          className="sidebar-scrim"
          aria-label="Close menu"
          onClick={() => setMobile(false)}
        />
      )}
      <aside className={'sidebar ' + (mobile ? 'open' : '')}>
        <Brand />
        <div className="campus-label">
          <span className="live-dot" />
          NSUT · New Delhi
        </div>
        <nav aria-label="Main navigation">
          {navigation.map(([value, icon, label]) => (
            <button
              key={value}
              className={page === value ? 'nav-item selected' : 'nav-item'}
              aria-current={page === value ? 'page' : undefined}
              onClick={() => navigate(value)}
            >
              <Icon name={icon} />
              {label}
              {value === 'announcements' && unread > 0 && (
                <span className="nav-count">{unread}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="nav-separator" />
        <span className="sidebar-section-label">Account</span>
        <button
          className={'nav-item ' + (page === 'profile' ? 'selected' : '')}
          aria-current={page === 'profile' ? 'page' : undefined}
          onClick={() => navigate('profile')}
        >
          <Icon name="user" />
          My profile
        </button>
        {user.role === 'admin' && (
          <button
            className={'nav-item ' + (page === 'admin' ? 'selected' : '')}
            onClick={() => navigate('admin')}
          >
            <Icon name="shield" />
            Admin
          </button>
        )}
        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <Avatar name={user.name} />
            <span>
              <strong>{user.name}</strong>
              <small>
                {user.branch} · Semester {user.semester}
              </small>
            </span>
          </div>
          <button className="signout" onClick={logout}>
            <Icon name="logout" size={15} />
            Sign out
          </button>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              onClick={() => setMobile(!mobile)}
              aria-label="Open menu"
            >
              <Icon name="menu" />
            </button>
            <span>Campus</span>
            <Icon name="chevron" size={13} />
            <strong>
              {
                [
                  ...navigation,
                  ['profile', '', 'My profile'],
                  ['admin', '', 'Admin'],
                ].find((n) => n[0] === page)?.[2]
              }
            </strong>
          </div>
          <div className="topbar-actions">
            <ThemeButton theme={theme} onToggle={toggleTheme} />
            <div className="search-box">
              <Icon name="search" size={17} />
              <input
                ref={search}
                aria-label="Search posts and announcements"
                placeholder="Search campus"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  if (['feed', 'profile', 'admin', 'timetable'].includes(page)) {
                    location.hash = 'discussions'
                    setPage('discussions')
                    setCategory('All')
                  }
                }}
              />
              <kbd>{navigator.platform.includes('Mac') ? '⌘ K' : 'Ctrl K'}</kbd>
              {query && (
                <button onClick={() => setQuery('')} aria-label="Clear search">
                  <Icon name="close" size={14} />
                </button>
              )}
            </div>
            <button
              className="notification-button icon-button"
              onClick={() => setModal({ type: 'notifications' })}
              aria-label={`Notifications, ${unread} unread`}
            >
              <Icon name="bell" />
              {unread > 0 && <i />}
            </button>
          </div>
        </header>
        <main
          id="main"
          tabIndex={-1}
          className={
            'main ' +
            (['timetable', 'profile', 'admin'].includes(page)
              ? 'full-page'
              : '')
          }
        >
          {!online && (
            <div className="status-banner">
              <Icon name="calendar" size={18} />
              Offline
            </div>
          )}
          {error && (
            <div className="error-banner" role="alert">
              <span>{error}</span>
              <button onClick={load}>
                Try again <Icon name="arrow" size={15} />
              </button>
            </div>
          )}
          {loading ? (
            <div className="loading-state">
              <span className="loading-spinner" />
              <h2>Loading…</h2>
            </div>
          ) : (
            <>
              {page === 'feed' && (
                <Feed
                  posts={posts}
                  announcements={announcements}
                  upcoming={upcoming}
                  user={user}
                  onNavigate={navigate}
                  onOpenPost={(id) => setModal({ type: 'thread', id })}
                  onOpenNotice={(item) => setModal({ type: 'notice', item })}
                />
              )}
              {['discussions', 'saved', 'announcements'].includes(
                page,
              ) && (
                <div className="forum-content">
                  <section className="primary-content">
                    {page === 'discussions' && (
                      <>
                        <div className="page-heading">
                          <div>
                            <h1>Discussions</h1>
                            <p>Questions and posts by topic.</p>
                          </div>
                          <button
                            className="button primary"
                            onClick={() => setModal({ type: 'post' })}
                          >
                            <Icon name="plus" size={17} />
                            New post
                          </button>
                        </div>
                      </>
                    )}
                    {page === 'saved' && (
                      <div className="page-heading">
                        <div>
                          <h1>Saved posts</h1>
                          <p>Posts you bookmarked.</p>
                        </div>
                        <span className="count-pill">
                          {
                            posts.filter((p) => user.saved?.includes(p.id))
                              .length
                          }{' '}
                          saved
                        </span>
                      </div>
                    )}
                    {page === 'announcements' && (
                      <div className="page-heading">
                        <div>
                          <h1>Announcements</h1>
                          <p>Notices posted by campus administrators.</p>
                        </div>
                        {user.role === 'admin' && (
                          <button
                            className="button primary"
                            onClick={() => setModal({ type: 'announcement' })}
                          >
                            <Icon name="plus" size={17} />
                            New update
                          </button>
                        )}
                      </div>
                    )}
                    <div className="feed-title-row">
                      <h2>
                        {query
                          ? 'Search results'
                          : page === 'announcements'
                            ? 'Announcements'
                            : page === 'saved'
                              ? 'Saved posts'
                              : 'Posts'}
                      </h2>
                      {page !== 'announcements' && (
                        <label className="sort-control">
                          <span className="sr-only">Sort conversations</span>
                          <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                          >
                            <option value="latest">Latest first</option>
                            <option value="popular">Most liked</option>
                          </select>
                        </label>
                      )}
                    </div>
                    <div className="filter-tabs" aria-label="Filter by topic">
                      {['All', ...categories].map((c) => (
                        <button
                          key={c}
                          className={category === c ? 'selected' : ''}
                          onClick={() => setCategory(c)}
                          aria-pressed={category === c}
                        >
                          {c === 'All' ? 'All' : c}
                        </button>
                      ))}
                    </div>
                    {page === 'announcements' ? (
                      <div className="announcement-list">
                        {visibleAnnouncements.map((a) => (
                          <article
                            className={
                              'announcement-card ' +
                              (a.is_pinned ? 'pinned' : '')
                            }
                            key={a.id}
                          >
                            <div className="announcement-meta">
                              <span
                                className={'tag ' + categoryClass(a.category)}
                              >
                                {a.category}
                              </span>
                              {a.is_pinned && (
                                <span className="pinned-label">
                                  <Icon name="pin" size={14} />
                                  PINNED UPDATE
                                </span>
                              )}
                              <small>{date(a.created_at)}</small>
                            </div>
                            <h2>{a.title}</h2>
                            <p>{a.content}</p>
                            <div className="announcement-footer">
                              <span>
                                <Icon name="shield" size={16} />
                                {a.posted_by}
                              </span>
                              {user.role === 'admin' && (
                                <div>
                                  <button
                                    className="icon-button"
                                    aria-label={'Edit ' + a.title}
                                    onClick={() =>
                                      setModal({
                                        type: 'announcement',
                                        item: a,
                                      })
                                    }
                                  >
                                    <Icon name="edit" size={17} />
                                  </button>
                                  <button
                                    className="icon-button"
                                    aria-label={'Delete ' + a.title}
                                    onClick={() =>
                                      setModal({
                                        type: 'delete',
                                        item: a,
                                        kind: 'announcement',
                                      })
                                    }
                                  >
                                    <Icon name="trash" size={17} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </article>
                        ))}
                        {!visibleAnnouncements.length && (
                          <Empty
                            icon="bell"
                            title="No announcements found."
                            description="Try a different topic or search."
                          />
                        )}
                      </div>
                    ) : (
                      <div className="post-list">
                        {filtered.map((p) => (
                          <PostCard
                            key={p.id}
                            post={p}
                            user={user}
                            onLike={like}
                            onSave={savePost}
                            onOpen={(id) => setModal({ type: 'thread', id })}
                            onDelete={(item) =>
                              setModal({ type: 'delete', item })
                            }
                          />
                        ))}
                        {!filtered.length && (
                          <Empty
                            icon={page === 'saved' ? 'bookmark' : 'search'}
                            title={
                              page === 'saved'
                                ? 'No saved posts yet.'
                                : 'No posts found.'
                            }
                            description={
                              page === 'saved'
                                ? 'Use the bookmark button on a post to save it.'
                                : 'Try another search or post a question.'
                            }
                            action={
                              <button
                                className="button outline"
                                onClick={() =>
                                  page === 'saved'
                                    ? navigate('discussions')
                                    : setModal({ type: 'post' })
                                }
                              >
                                {page === 'saved'
                                  ? 'Browse discussions'
                                  : 'New post'}
                                <Icon name="arrow" size={16} />
                              </button>
                            }
                          />
                        )}
                      </div>
                    )}
                  </section>
                </div>
              )}
              {page === 'timetable' && (
                <Timetable tables={tables} user={user} notify={notify} />
              )}
              {page === 'profile' && (
                <Profile
                  key={user.id}
                  user={user}
                  tables={tables}
                  posts={posts}
                  onSave={async (body) =>
                    updateUser(await api('/me', 'PATCH', body))
                  }
                  notify={notify}
                />
              )}
              {page === 'admin' && user.role === 'admin' && (
                <>
                  <div className="page-heading">
                    <div>
                      <h1>Admin</h1>
                      <p>Manage announcements and student posts.</p>
                    </div>
                    <button
                      className="button primary"
                      onClick={() => setModal({ type: 'announcement' })}
                    >
                      <Icon name="plus" size={17} />
                      Publish announcement
                    </button>
                  </div>
                  <div className="admin-stats">
                    <div>
                      <Icon name="bell" />
                      <strong>{announcements.length}</strong>
                      <span>Announcements</span>
                    </div>
                    <div>
                      <Icon name="chat" />
                      <strong>{posts.length}</strong>
                      <span>Conversations</span>
                    </div>
                    <div>
                      <Icon name="pin" />
                      <strong>
                        {announcements.filter((a) => a.is_pinned).length}
                      </strong>
                      <span>Pinned updates</span>
                    </div>
                  </div>
                  <section className="admin-panel">
                    <div className="feed-title-row">
                      <h2>Manage announcements</h2>
                      <span className="muted">Visible to all students</span>
                    </div>
                    {announcements.map((a) => (
                      <div className="admin-row" key={a.id}>
                        <div>
                          <strong>{a.title}</strong>
                          <small>
                            {a.posted_by} · {date(a.created_at)}
                            {a.is_pinned ? ' · Pinned' : ''}
                          </small>
                        </div>
                        <button
                          className="icon-button"
                          aria-label={'Edit ' + a.title}
                          onClick={() =>
                            setModal({ type: 'announcement', item: a })
                          }
                        >
                          <Icon name="edit" size={18} />
                        </button>
                        <button
                          className="icon-button"
                          aria-label={'Delete ' + a.title}
                          onClick={() =>
                            setModal({
                              type: 'delete',
                              item: a,
                              kind: 'announcement',
                            })
                          }
                        >
                          <Icon name="trash" size={18} />
                        </button>
                      </div>
                    ))}
                  </section>
                  <section className="admin-panel">
                    <div className="feed-title-row">
                      <h2>Manage posts</h2>
                      <span className="muted">Remove posts if needed</span>
                    </div>
                    {posts.map((p) => (
                      <div className="admin-row" key={p.id}>
                        <div>
                          <strong>{p.title}</strong>
                          <small>
                            {p.author} · {p.category}
                          </small>
                        </div>
                        <button
                          className="button text"
                          onClick={() => setModal({ type: 'thread', id: p.id })}
                        >
                          View
                        </button>
                        <button
                          className="icon-button"
                          aria-label={'Delete ' + p.title}
                          onClick={() => setModal({ type: 'delete', item: p })}
                        >
                          <Icon name="trash" size={18} />
                        </button>
                      </div>
                    ))}
                  </section>
                </>
              )}
            </>
          )}
        </main>
      </div>
      {modal?.type === 'post' && (
        <Compose user={user} onSubmit={publish} onClose={close} />
      )}
      {modal?.type === 'announcement' && (
        <Compose
          user={user}
          announcement
          initial={modal.item}
          onSubmit={publish}
          onClose={close}
        />
      )}
      {thread && (
        <Thread post={thread} user={user} onClose={close} onReply={reply} />
      )}
      {modal?.type === 'delete' && (
        <Modal title="Delete this item?" onClose={close}>
          <p className="muted">
            “{modal.item.title}” will be removed. This also removes any replies
            on the post.
          </p>
          <div className="modal-footer">
            <button className="button outline" onClick={close}>
              Keep it
            </button>
            <button className="button danger" onClick={remove}>
              Remove {modal.kind === 'announcement' ? 'announcement' : 'post'}
              <Icon name="trash" size={16} />
            </button>
          </div>
        </Modal>
      )}
      {modal?.type === 'notice' && (
        <Modal title="Announcement" onClose={close}>
          <div className="notice-detail">
            <span
              className={
                'tag ' + categoryClass(modal.item.category || 'Campus')
              }
            >
              {modal.item.category || 'Campus'}
            </span>
            <h2>{modal.item.title}</h2>
            <p>{modal.item.content}</p>
            <div className="announcement-footer">
              <span>
                <Icon name="shield" size={16} />
                {modal.item.posted_by}
              </span>
              <small>{date(modal.item.created_at)}</small>
            </div>
          </div>
        </Modal>
      )}
      {modal?.type === 'notifications' && (
        <Modal title="Notifications" onClose={close}>
          <div className="notifications-intro">
            <p>
              {unread
                ? `${unread} unread updates on your noticeboard.`
                : 'You’re all caught up.'}
            </p>
            <button className="button text" onClick={markRead}>
              Mark all read
              <Icon name="check" size={16} />
            </button>
          </div>
          {announcements.map((a) => (
            <button
              className={
                'notification-row ' + (!read.includes(a.id) ? 'unread' : '')
              }
              key={a.id}
              onClick={() => {
                const next = [...new Set([...read, a.id])]
                setRead(next)
                localStorage.setItem('nsut-read', JSON.stringify(next))
                setModal({ type: 'notice', item: a })
              }}
            >
              <span>
                <Icon name="bell" />
              </span>
              <div>
                <strong>{a.title}</strong>
                <small>
                  {a.posted_by} · {date(a.created_at)}
                </small>
              </div>
              <Icon name="chevron" size={16} />
            </button>
          ))}
          {!announcements.length && (
            <Empty
              icon="bell"
              title="No notifications"
              description="Campus announcements will appear here."
            />
          )}
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <Icon name="check" size={18} />
          {toast}
          <button
            onClick={() => setToast('')}
            aria-label="Dismiss notification"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
