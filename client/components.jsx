import { useEffect, useRef, useState } from 'react'
import Icon from './icons'
import { categories, initials, date, categoryClass } from './helpers'

export function Avatar({ name, large = false }) {
  return (
    <span
      className={
        'avatar ' +
        (large ? 'large ' : '') +
        (['A', 'Y', 'P'].includes(name?.[0]) ? 'sage' : 'sand')
      }
    >
      {initials(name)}
    </span>
  )
}

export function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark">
        n<span>•</span>
      </span>
      <div>
        NSUT<span>connect</span>
      </div>
    </div>
  )
}

export function CampusDrawing() {
  return (
    <svg
      className="campus-drawing"
      viewBox="0 0 440 220"
      fill="none"
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round">
        <path d="M16 193h408M34 185h372M66 185V77l90-16v124M66 77l-16-8 90-16 16 8M50 69v110l16 6M156 185V90h151v95M156 90l75-17 76 17M168 96h127M307 185V56l76 14v115M307 56l16-8 76 14-16 8M383 70l16-8v116l-16 7M195 185v-47h73v47M207 138v47M256 138v47M230 139v46M189 185h86v8M185 193v7h94v-7M179 200v7h106v-7" />
        {[90, 117, 144].map((y) => (
          <g key={y}>
            {[78, 104, 130].map((x) => <path key={x} d={`M${x} ${y}v17m9-19v17M${x} ${y + 17}l9-2`} />)}
            {[320, 344, 368].map((x) => <path key={x} d={`M${x} ${y - 10}v17m9-15v17M${x} ${y + 7}l9 2`} />)}
          </g>
        ))}
        {[179, 207, 235, 263].map((x) => <rect key={x} x={x} y="108" width="17" height="16" />)}
        <path d="M39 185v-28m0 8c-29-7-27-28-16-38 10-10 11-26 16-30 5 4 6 20 16 30 11 10 13 31-16 38M407 185v-35m0 9c-22-5-22-25-13-33 8-8 10-20 13-23 3 3 5 15 13 23 9 8 9 28-13 33M84 201h57M316 200h50M98 210h25M345 208h36" />
        <circle cx="251" cy="38" r="18" opacity=".45" />
        <path d="M18 39h69M44 32h22M345 22h58" opacity=".3" />
      </g>
    </svg>
  )
}

export function Modal({ title, onClose, children, wide = false }) {
  const box = useRef(null)
  const closing = useRef(onClose)
  closing.current = onClose
  useEffect(() => {
    const prior = document.activeElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    box.current?.querySelector('input,textarea,select,button')?.focus()
    const key = (e) => {
      if (e.key === 'Escape') closing.current()
      if (e.key === 'Tab') {
        const elements = [
          ...box.current.querySelectorAll(
            'button,input,select,textarea,a[href]',
          ),
        ].filter((el) => !el.disabled)
        const first = elements[0],
          last = elements.at(-1)
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }
    document.addEventListener('keydown', key)
    return () => {
      document.body.style.overflow = overflow
      document.removeEventListener('keydown', key)
      prior?.focus()
    }
  }, [])
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        className={'modal ' + (wide ? 'wide' : '')}
        ref={box}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-heading">
          <h2>{title}</h2>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <Icon name="close" />
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}

export function Compose({ user, announcement, initial, onSubmit, onClose }) {
  const [title, setTitle] = useState(initial?.title || '')
  const [content, setContent] = useState(initial?.content || '')
  const [category, setCategory] = useState(initial?.category || 'Campus')
  const [pinned, setPinned] = useState(initial?.is_pinned || false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        category,
        ...(announcement ? { is_pinned: pinned } : {}),
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <Modal
      title={
        announcement
          ? initial
            ? 'Edit announcement'
            : 'Post an announcement'
          : 'New post'
      }
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <div className="compose-user">
          <Avatar name={user.name} />
          <div>
            <strong>{user.name}</strong>
            <small>
              {announcement
                ? 'Posting an announcement'
                : 'Posting as a student'}
            </small>
          </div>
        </div>
        <label>
          Topic
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Title
          <input
            required
            minLength={3}
            maxLength={140}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              announcement ? 'Give your update a clear title' : 'Post title'
            }
          />
        </label>
        <label>
          Message
          <textarea
            required
            minLength={3}
            maxLength={4000}
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your message"
          />
        </label>
        {announcement && (
          <label className="checkbox">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
            />
            Pin this update to the top
          </label>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="modal-footer">
          <button className="button text" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="button primary" disabled={busy}>
            {busy
              ? 'Publishing…'
              : initial
                ? 'Save changes'
                : announcement
                  ? 'Publish update'
                  : 'Publish post'}
            <Icon name="arrow" size={17} />
          </button>
        </div>
      </form>
    </Modal>
  )
}

export function PostCard({
  post,
  user,
  onLike,
  onSave,
  onOpen,
  onDelete,
  compact = false,
}) {
  const liked = post.liked_by?.includes(user.id),
    saved = user.saved?.includes(post.id)
  const [busy, setBusy] = useState(false)
  async function action(fn) {
    if (busy) return
    setBusy(true)
    try {
      await fn()
    } finally {
      setBusy(false)
    }
  }
  return (
    <article className={'post-card ' + (compact ? 'compact' : '')}>
      <div className="post-top">
        <Avatar name={post.author} />
        <div className="post-author">
          <strong>{post.author}</strong>
          <small>
            NSUT student <span>·</span> {date(post.created_at)}
          </small>
        </div>
        <span className={'tag ' + categoryClass(post.category)}>
          {post.category}
        </span>
      </div>
      <button className="post-title" onClick={() => onOpen(post.id)}>
        <h3>{post.title}</h3>
      </button>
      <p className="post-content">{post.content}</p>
      <div className="post-actions">
        <button
          className={liked ? 'active-action' : ''}
          disabled={busy}
          onClick={() => action(() => onLike(post.id))}
          aria-label={(liked ? 'Unlike' : 'Like') + ' ' + post.title}
          aria-pressed={!!liked}
        >
          <Icon name="heart" size={18} fill={liked ? 'currentColor' : 'none'} />
          <span>{post.likes}</span>
        </button>
        <button onClick={() => onOpen(post.id)}>
          <Icon name="chat" size={18} />
          <span>
            {post.comments?.length || 0}{' '}
            <span className="reply-label">replies</span>
          </span>
        </button>
        <div className="post-actions-spacer" />
        {(post.author_email === user.email || user.role === 'admin') && (
          <button
            className="delete-action"
            onClick={() => onDelete(post)}
            aria-label={'Delete ' + post.title}
          >
            <Icon name="trash" size={17} />
          </button>
        )}
        <button
          className={saved ? 'active-action' : ''}
          disabled={busy}
          onClick={() => action(() => onSave(post.id))}
          aria-label={(saved ? 'Unsave' : 'Save') + ' ' + post.title}
          aria-pressed={!!saved}
        >
          <Icon
            name="bookmark"
            size={18}
            fill={saved ? 'currentColor' : 'none'}
          />
        </button>
      </div>
    </article>
  )
}

export function Thread({ post, user, onClose, onReply }) {
  const [reply, setReply] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await onReply(post.id, reply)
      setReply('')
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <Modal title="Post and replies" wide onClose={onClose}>
      <div className="thread">
        <span className={'tag ' + categoryClass(post.category)}>
          {post.category}
        </span>
        <h2>{post.title}</h2>
        <div className="compose-user">
          <Avatar name={post.author} />
          <div>
            <strong>{post.author}</strong>
            <small>{date(post.created_at)} · NSUT community</small>
          </div>
        </div>
        <p className="thread-content">{post.content}</p>
        <div className="thread-replies">
          <h3>{post.comments?.length || 0} replies</h3>
          {!post.comments?.length && <p className="muted">No replies yet.</p>}
          {post.comments?.map((c) => (
            <div className="comment" key={c.id}>
              <Avatar name={c.author} />
              <div>
                <strong>{c.author}</strong>
                <small>{date(c.created_at)}</small>
                <p>{c.content}</p>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={submit}>
          <label>
            Your reply
            <textarea
              autoFocus
              rows={3}
              required
              maxLength={2000}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Write a reply"
            />
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="modal-footer">
            <button className="button primary" disabled={busy || !reply.trim()}>
              {busy ? 'Posting…' : 'Post reply'}
              <Icon name="arrow" size={17} />
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export function Empty({ icon = 'chat', title, description, action }) {
  return (
    <div className="empty-state">
      <span>
        <Icon name={icon} size={29} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  )
}
