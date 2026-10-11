import { useEffect, useRef, useState } from 'react'
import Icon from '../icons'
import ThemeButton from '../ThemeButton'
import { Brand, CampusDrawing } from '../components'
import { api } from '../api'

export default function Login({ onLogin, config, theme, onToggleTheme }) {
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const google = useRef(null)
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
            onLogin(await api('/auth/google', 'POST', { credential }))
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
          <h1>NSUT Connect</h1>
          <p>
            Ask classmates a question, read campus announcements, or check your
            timetable.
          </p>
          <CampusDrawing />
          <div className="login-bottom">
            <span>Student project</span>
            <span>2026</span>
          </div>
        </div>
      </section>
      <section className="login-form">
        <div className="login-welcome">
          <h2>Sign in</h2>
          <p>
            Use your @nsut.ac.in Google account.
          </p>
          {config.google_client_id ? (
            <div ref={google} className="google-signin" />
          ) : (
            <div className="google-note">
              <Icon name="shield" />
              <span>
                Campus accounts use <strong>@nsut.ac.in</strong>.<br />
                <small>Google sign-in is loading. Please refresh if this stays here.</small>
              </span>
            </div>
          )}
          {busy === 'google' && <p role="status">Signing in…</p>}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="login-foot">
            <span>NSUT Connect</span>
            <span>Campus accounts</span>
          </div>
        </div>
      </section>
    </div>
  )
}
