import { useEffect, useRef, useState } from 'react'
import { api, session, storeSession, isHostedDemo } from './api'
import Icon from './icons'
import { selectedSection } from './timetable'
import {
  categories,
  navigation,
  todayName,
  initialDay,
  date,
  categoryClass,
} from './helpers'
import {
  Avatar,
  Brand,
  CampusDrawing,
  Modal,
  Compose,
  PostCard,
  Thread,
  Empty,
} from './components'
import Login from './pages/Login'
import Timetable from './pages/Timetable'
import Profile from './pages/Profile'

// App owns the shared data and passes it to the screens through props.
export default function App() {
  const [auth, setAuth] = useState(session)
  const [config, setConfig] = useState({ google_client_id: '', demo: true })
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
        u.saved.includes(postId)
          ? 'Saved to your collection.'
          : 'Removed from saved posts.',
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
      notify('Your conversation is live.')
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
  if (!auth) return <Login onLogin={login} config={config} />
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
          THE STUDENT COMMONS
        </div>
        <nav aria-label="Main navigation">
          {navigation.map(([value, icon, label]) => (
            <button
              key={value}
              className={page === value ? 'nav-item selected' : 'nav-item'}
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
        <span className="sidebar-section-label">YOUR SPACE</span>
        <button
          className={'nav-item ' + (page === 'profile' ? 'selected' : '')}
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
            Admin studio
          </button>
        )}
        <div className="sidebar-bottom">
          <div className="commons-note">
            <Icon name="book" size={25} />
            <strong>Better, together.</strong>
            <p>
              A place for your people,
              <br />
              your questions, your ideas.
            </p>
            <button onClick={() => setModal({ type: 'about' })}>
              About the commons <Icon name="arrow" size={16} />
            </button>
          </div>
          <button className="sidebar-user" onClick={() => navigate('profile')}>
            <Avatar name={user.name} />
            <span>
              <strong>{user.name}</strong>
              <small>
                {user.branch} · Semester {user.semester}
              </small>
            </span>
            <Icon name="chevron" size={16} />
          </button>
          <button className="signout" onClick={logout}>
            <Icon name="logout" size={15} />
            Sign out<span>{isHostedDemo ? 'BROWSER DEMO' : 'LOCAL API'}</span>
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
                  ['admin', '', 'Admin studio'],
                ].find((n) => n[0] === page)?.[2]
              }
            </strong>
          </div>
          <div className="topbar-actions">
            <div className="search-box">
              <Icon name="search" size={17} />
              <input
                ref={search}
                aria-label="Search posts and announcements"
                placeholder="Search your campus"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  if (['profile', 'admin', 'timetable'].includes(page)) {
                    location.hash = 'feed'
                    setPage('feed')
                    setCategory('All')
                  }
                }}
              />
              <kbd>⌘ K</kbd>
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
            <button
              className="top-avatar"
              aria-label="Open your profile"
              onClick={() => navigate('profile')}
            >
              <Avatar name={user.name} />
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
              You’re offline. Your cached timetable is still here.
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
              <h2>Gathering your campus…</h2>
            </div>
          ) : (
            <>
              {['feed', 'discussions', 'saved', 'announcements'].includes(
                page,
              ) && (
                <div className="content-grid">
                  <section className="primary-content">
                    {page === 'feed' && (
                      <>
                        <div className="welcome-heading">
                          <span className="eyebrow">
                            {new Date()
                              .toLocaleDateString('en-IN', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                timeZone: 'Asia/Kolkata',
                              })
                              .toUpperCase()}
                          </span>
                          <h1>Hey {user.name.split(' ')[0]}, you’re home.</h1>
                          <p>
                            Here’s what’s happening in your corner of campus.
                          </p>
                        </div>
                        <div className="welcome-banner">
                          <div>
                            <span className="eyebrow">
                              YOUR CAMPUS. YOUR PEOPLE.
                            </span>
                            <h2>
                              Good things start
                              <br />
                              with a conversation.
                            </h2>
                            <button
                              onClick={() => {
                                navigate('discussions')
                              }}
                            >
                              Find your next one <Icon name="arrow" size={17} />
                            </button>
                          </div>
                          <CampusDrawing />
                          <span className="banner-edition">
                            THE COMMONS / VOL. 01
                          </span>
                        </div>
                        <button
                          className="composer"
                          onClick={() => setModal({ type: 'post' })}
                        >
                          <Avatar name={user.name} />
                          <span>
                            Got a question, an idea, or a little campus news?
                          </span>
                          <span className="composer-plus">
                            <Icon name="plus" />
                          </span>
                        </button>
                      </>
                    )}
                    {page === 'discussions' && (
                      <>
                        <div className="page-heading">
                          <div>
                            <span className="eyebrow">
                              ASK. SHARE. FIGURE IT OUT TOGETHER.
                            </span>
                            <h1>Let’s talk campus.</h1>
                            <p>A good question can take you somewhere new.</p>
                          </div>
                          <button
                            className="button primary"
                            onClick={() => setModal({ type: 'post' })}
                          >
                            <Icon name="plus" size={17} />
                            New conversation
                          </button>
                        </div>
                        <div className="topic-grid">
                          {categories.slice(0, 4).map((c, i) => (
                            <button
                              key={c}
                              className={
                                'topic ' +
                                categoryClass(c) +
                                (category === c ? ' chosen' : '')
                              }
                              onClick={() =>
                                setCategory(category === c ? 'All' : c)
                              }
                            >
                              <Icon
                                name={['book', 'calendar', 'code', 'home'][i]}
                                size={24}
                              />
                              <strong>{c}</strong>
                              <span>
                                {posts.filter((p) => p.category === c).length}{' '}
                                conversations
                              </span>
                              <Icon name="arrow" size={17} />
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                    {page === 'saved' && (
                      <div className="page-heading">
                        <div>
                          <span className="eyebrow">
                            KEEP THE GOOD STUFF CLOSE
                          </span>
                          <h1>Worth coming back to.</h1>
                          <p>
                            Your bookmarked conversations, all in one place.
                          </p>
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
                          <span className="eyebrow">
                            THE CAMPUS NOTICEBOARD
                          </span>
                          <h1>Stay in the loop.</h1>
                          <p>Updates that deserve a place on your radar.</p>
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
                            ? 'Campus updates'
                            : page === 'saved'
                              ? 'Your collection'
                              : 'The conversation'}
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
                          {c === 'All' ? 'For you' : c}
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
                            title="Nothing on this board yet."
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
                                ? 'A place for your favourites.'
                                : 'No conversations found.'
                            }
                            description={
                              page === 'saved'
                                ? 'Tap the bookmark on any post to keep it here.'
                                : 'Try another topic or start something new.'
                            }
                            action={
                              <button
                                className="button outline"
                                onClick={() =>
                                  page === 'saved'
                                    ? navigate('feed')
                                    : setModal({ type: 'post' })
                                }
                              >
                                {page === 'saved'
                                  ? 'Explore the feed'
                                  : 'Start a conversation'}
                                <Icon name="arrow" size={16} />
                              </button>
                            }
                          />
                        )}
                      </div>
                    )}
                    <div className="feed-end">
                      <span />
                      YOU’RE IN GOOD COMPANY
                      <span />
                    </div>
                  </section>
                  <aside className="right-rail">
                    <div className="rail-heading">
                      <Icon name="pin" size={18} />
                      <h2>On the noticeboard</h2>
                      <button
                        aria-label="View all announcements"
                        onClick={() => navigate('announcements')}
                      >
                        <Icon name="arrow" size={17} />
                      </button>
                    </div>
                    <div className="noticeboard">
                      {announcements.slice(0, 2).map((a, i) => (
                        <button
                          key={a.id}
                          className={'notice ' + (i === 0 ? 'cream' : 'white')}
                          onClick={() => setModal({ type: 'notice', item: a })}
                        >
                          <div>
                            <span className="eyebrow">
                              {a.category?.toUpperCase() || 'CAMPUS'} UPDATE
                            </span>
                            {a.is_pinned && <Icon name="pin" size={15} />}
                          </div>
                          <h3>{a.title}</h3>
                          <p>{a.content}</p>
                          <div className="notice-bottom">
                            <small>{date(a.created_at)}</small>
                            <Icon name="arrow" size={17} />
                          </div>
                        </button>
                      ))}
                      {!announcements.length && (
                        <p className="muted">
                          New campus updates will appear here.
                        </p>
                      )}
                    </div>
                    <div className="rail-heading schedule-rail-heading">
                      <Icon name="calendar" size={18} />
                      <h2>
                        {todayName() === 'Sunday' || todayName() === 'Saturday'
                          ? 'Next up: Monday'
                          : 'Your day ahead'}
                      </h2>
                      <span>{user.branch}</span>
                    </div>
                    <div className="day-ahead">
                      <div className="day-ahead-top">
                        <span>{initialDay()}</span>
                        <small>SEM {user.semester}</small>
                      </div>
                      {upcoming.slice(0, 3).map((c, i) => (
                        <div className="mini-class" key={i}>
                          <span className="timeline-dot" />
                          <small>{c.time}</small>
                          <strong>{c.subject.replace(/\s*\(.*\)/, '')}</strong>
                          <span>{c.room}</span>
                        </div>
                      ))}
                      {!upcoming.length && (
                        <p className="muted">No classes on this schedule.</p>
                      )}
                      <button
                        className="rail-link"
                        onClick={() => navigate('timetable')}
                      >
                        Open full timetable
                        <Icon name="arrow" size={17} />
                      </button>
                    </div>
                    <div className="community-note">
                      <span className="scribble">↗</span>
                      <span className="eyebrow">A SMALL REMINDER</span>
                      <h3>
                        Someone here knows
                        <br />
                        what you’re figuring out.
                      </h3>
                      <p>
                        Ask the question.
                        <br />
                        Share the notes. Say hello.
                      </p>
                      <button onClick={() => setModal({ type: 'post' })}>
                        Start something <Icon name="arrow" size={16} />
                      </button>
                    </div>
                    <div className="rail-foot">
                      NSUT CONNECT · CAMPUS COMMONS
                      <br />
                      Sample data · Made for connection
                    </div>
                  </aside>
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
                      <span className="eyebrow">
                        TAKE CARE OF YOUR COMMUNITY
                      </span>
                      <h1>The admin studio.</h1>
                      <p>
                        Clear updates. Thoughtful conversations. A better
                        commons.
                      </p>
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
                      <span>Campus updates</span>
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
                      <h2>Moderate conversations</h2>
                      <span className="muted">Keep the commons welcoming</span>
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
        <footer className="app-footer">
          <span>NSUT Connect</span>
          <span>Your campus, in good company.</span>
          <button onClick={() => setModal({ type: 'about' })}>
            About this prototype ↗
          </button>
        </footer>
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
        <Modal title="Remove this from the commons?" onClose={close}>
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
        <Modal title="From the noticeboard" onClose={close}>
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
        <Modal title="Your campus updates" onClose={close}>
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
              title="A quiet moment."
              description="Campus announcements will appear here."
            />
          )}
        </Modal>
      )}
      {modal?.type === 'about' && (
        <Modal title="A commons for your campus." onClose={close}>
          <div className="about-copy">
            <Brand />
            <p>
              NSUT Connect brings student conversations, campus announcements,
              and your timetable into one familiar place.
            </p>
            <h3>A working campus prototype</h3>
            <p>
              {isHostedDemo
                ? 'This online version runs with sample data saved in your browser. Open it on the same device to find your changes.'
                : 'This local version uses the FastAPI server and saves sample data to a JSON file.'}{' '}
              Timetables are transcribed from the supplied July–December 2026
              PDF. Notices and discussions are sample data.
            </p>
            <h3>Made to feel like community</h3>
            <p>
              Ask questions, reply to peers, bookmark useful posts, and keep
              your week in view. Admins can publish and manage announcements.
            </p>
            <p className="form-note">
              Demo accounts are for exploring roles. Google sign-in is available
              in the local app when an administrator configures it.
            </p>
          </div>
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
