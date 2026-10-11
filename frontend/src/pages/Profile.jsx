import { useState } from 'react'
import Icon from '../icons'
import { Avatar } from '../components'

export default function Profile({ user, tables, posts, onSave, notify }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user.name)
  const [bio, setBio] = useState(user.bio || '')
  const [branch, setBranch] = useState(user.branch)
  const [semester, setSemester] = useState(user.semester)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function save(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await onSave({ name: name.trim(), bio: bio.trim(), branch, semester })
      setEditing(false)
      notify('Profile updated.')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>My profile</h1>
          <p>Your account details.</p>
        </div>
      </div>
      <section className="profile-panel">
        <div className="profile-cover" />
        <div className="profile-intro">
          <Avatar name={user.name} large />
          <button
            className="button outline"
            onClick={() => setEditing(!editing)}
          >
            <Icon name="edit" size={17} />
            {editing ? 'Close editor' : 'Edit profile'}
          </button>
        </div>
        <div className="profile-body">
          <span className="tag campus">
            {user.role === 'admin' ? 'Administrator' : 'Student'}
          </span>
          <h2>{user.name}</h2>
          <p className="muted">{user.email}</p>
          <p>{user.bio || 'No bio added.'}</p>
          <div className="profile-meta">
            <span>
              <Icon name="book" size={17} />
              {user.branch} · Semester {user.semester}
            </span>
            <span>
              <Icon name="location" size={17} />
              NSUT, New Delhi
            </span>
          </div>
          <div className="profile-stats">
            <div>
              <strong>
                {posts.filter((p) => p.author_email === user.email).length}
              </strong>
              <span>Posts</span>
            </div>
            <div>
              <strong>{user.saved?.length || 0}</strong>
              <span>Saved posts</span>
            </div>
            <div>
              <strong>
                {posts.reduce(
                  (sum, p) =>
                    sum +
                    (p.comments || []).filter((c) => c.author === user.name)
                      .length,
                  0,
                )}
              </strong>
              <span>Replies</span>
            </div>
          </div>
          {editing && (
            <form className="profile-form" onSubmit={save}>
              <label>
                Name
                <input
                  required
                  minLength={2}
                  maxLength={80}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label>
                Bio
                <textarea
                  rows={3}
                  maxLength={280}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </label>
              <div className="two-fields">
                <label>
                  Branch
                  <select
                    value={branch}
                    onChange={(e) => {
                      setBranch(e.target.value)
                      setSemester(Object.keys(tables[e.target.value] || {})[0])
                    }}
                  >
                    {Object.keys(tables).map((b) => (
                      <option key={b}>{b}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Semester
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                  >
                    {Object.keys(tables[branch] || {}).map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
              </div>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <button className="button primary" disabled={busy}>
                {busy ? 'Saving…' : 'Save profile'}
                <Icon name="check" size={17} />
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  )
}
