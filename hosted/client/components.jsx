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
      viewBox="0 0 440 180"
      fill="none"
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1.4">
        <path d="M0 164h440M35 164V92h85v72M41 92l38-23 35 23M65 69V51h27v18M79 51V36M79 36h27l-6 6 6 6H79M120 164V58h152v106M130 58V48h132v10M165 48V25h62v23M177 25V15h38v10M190 15V5h12v10M272 164V93h108v71M279 93l47-24 47 24M314 69V53h25v16M192 164v-30a12 12 0 0 1 24 0v30M184 130h40M25 164v-28m0 0c-28-26-14-46 0-58 14 12 28 32 0 58ZM405 164v-32m0 0c-28-22-12-42 0-55 12 13 28 33 0 55Z" />
        <path d="M50 110h13v18H50zM89 110h13v18H89zM141 75h17v19h-17zM180 75h17v19h-17zM219 75h17v19h-17zM250 75h10v19h-10zM141 110h17v19h-17zM250 110h10v19h-10zM288 110h16v20h-16zM319 110h16v20h-16zM350 110h16v20h-16zM151 148h18M239 148h17M75 146h13" />
        <circle cx="201" cy="43" r="7" />
        <path d="M201 39v5l3 1" />
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
        <div className="form-note">Do not share private contact details.</div>
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
