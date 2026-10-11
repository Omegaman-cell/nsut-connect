import { useEffect, useRef, useState } from 'react'
import Icon from '../icons'
import ThemeButton from '../ThemeButton'
import { Brand, CampusDrawing } from '../components'
import { api, isHostedDemo } from '../api'

export default function Login({ onLogin, config, theme, onToggleTheme }) {
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const google = useRef(null)
  async function enter(email) {
    setBusy(email)
    setError('')
    try {
      onLogin(await api('/auth/demo', 'POST', { email }))
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy('')
    }
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
        callback: async ({ credential }) => {
          try {
            onLogin(await api('/auth/google', 'POST', { credential }))
          } catch (e) {
            setError(e.message)
          }
        },
      })
      window.google.accounts.id.renderButton(google.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
      })
    }
    document.head.appendChild(script)
    return () => {
      active = false
      script.remove()
    }
  }, [config.google_client_id, onLogin])
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
            {config.demo
              ? 'Choose a demo account below.'
              : 'Use your @nsut.ac.in Google account.'}
          </p>
          {config.google_client_id ? (
            <div ref={google} className="google-signin" />
          ) : (
            <div className="google-note">
              <Icon name="shield" />
              <span>
                Campus accounts use <strong>@nsut.ac.in</strong>.<br />
                <small>Google sign-in is not configured for this demo.</small>
              </span>
            </div>
          )}
          {config.demo && (
            <>
              <div className="divider">
                <span>Demo accounts</span>
              </div>
              <button
                className="button primary full"
                disabled={!!busy}
                onClick={() => enter('student@nsut.ac.in')}
              >
                {busy === 'student@nsut.ac.in' ? 'Signing in…' : 'Student demo'}
                <Icon name="arrow" />
              </button>
              <button
                className="button outline full"
                disabled={!!busy}
                onClick={() => enter('admin@nsut.ac.in')}
              >
                {busy === 'admin@nsut.ac.in' ? 'Signing in…' : 'Admin demo'}
                <Icon name="shield" />
              </button>
            </>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {config.demo && (
            <p className="demo-note">
              Demo accounts use sample data.
              <br />
              {isHostedDemo
                ? 'Your demo changes are saved in this browser.'
                : 'Your demo changes are saved on the local server.'}
            </p>
          )}
          <div className="login-foot">
            <span>NSUT Connect</span>
            <span>Demo</span>
          </div>
        </div>
      </section>
    </div>
  )
}
