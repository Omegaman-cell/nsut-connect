import { useEffect, useRef, useState } from 'react'
import ThemeButton from '../ThemeButton'
import Icon from '../icons'
import { Brand, CampusDrawing } from '../components'
import { api } from '../api'

export default function Login({ onLogin, config, theme, onToggleTheme }) {
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [role, setRole] = useState('student')
  const selectedRole = useRef('student')
  const google = useRef(null)
  function chooseRole(value) {
    selectedRole.current = value
    setRole(value)
    setError('')
  }
  useEffect(() => {
    if (!config.google_client_id) return
    let active = true
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => {
      if (!active || !window.google) return
      window.google.accounts.id.initialize({
        client_id: config.google_client_id,
        hd: 'nsut.ac.in',
        ...(config.nonce ? { nonce: config.nonce } : {}),
        auto_select: false,
        callback: async ({ credential }) => {
          setBusy('google')
          setError('')
          try {
            onLogin(await api('/auth/google', 'POST', { credential, role: selectedRole.current }))
          } catch (e) {
            setError(e.message)
          } finally {
            setBusy('')
          }
        },
      })
      window.google.accounts.id.renderButton(google.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
      })
    }
    script.onerror = () => setError('Google sign-in could not load. Check your connection and try again.')
    document.head.appendChild(script)
    return () => {
      active = false
      script.remove()
    }
  }, [config.google_client_id, config.nonce])
  return (
    <div className="login">
      <div className="login-theme">
        <ThemeButton theme={theme} onToggle={onToggleTheme} />
      </div>
      <section className="login-story">
        <Brand />
        <div className="login-copy">
          <span className="eyebrow light">NSUT · New Delhi</span>
          <h1>NSUT<span>Connect.</span></h1>
          <p>
            Ask classmates a question, read campus announcements, or check your
            timetable.
          </p>
        </div>
        <div className="login-campus"><CampusDrawing /></div>
      </section>
      <section className="login-form">
        <div className="login-welcome">
          <span className="login-symbol"><Icon name="arrow" size={24} /></span>
          <span className="eyebrow">Campus account</span>
          <h2>Sign in</h2>
          <p>
            Use your @nsut.ac.in Google account.
          </p>
          <div className="login-roles segmented" role="group" aria-label="Sign-in role">
            <button type="button" className={role === 'student' ? 'selected' : ''} aria-pressed={role === 'student'} disabled={!!busy} onClick={() => chooseRole('student')}>Student</button>
            <button type="button" className={role === 'admin' ? 'selected' : ''} aria-pressed={role === 'admin'} disabled={!!busy} onClick={() => chooseRole('admin')}>Admin</button>
          </div>
          {config.google_client_id ? (
            <div ref={google} className="google-signin" />
          ) : (
            <p role="status">Loading sign-in…</p>
          )}
          {busy === 'google' && <p role="status">Signing in…</p>}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
