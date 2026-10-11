import { useEffect, useRef, useState } from 'react'
import Icon from '../icons'
import { Avatar, Brand, CampusDrawing, Empty } from '../components'
import { days, initialDay } from '../helpers'
import { api, isHostedDemo } from '../api'

export default function Login({ onLogin, config }) {
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
      <section className="login-story">
        <Brand />
        <div className="login-copy">
          <span className="eyebrow light">THE NSUT STUDENT COMMONS</span>
          <h1>
            Your campus.
            <br />
            In good <em>company.</em>
          </h1>
          <p>
            From the next lecture to your next big idea.
            <br />A little less noise. A lot more connection.
          </p>
          <CampusDrawing />
          <div className="login-bottom">
            <span>DISCUSS. DISCOVER. BELONG.</span>
            <span>NEW DELHI ↗</span>
          </div>
        </div>
      </section>
      <section className="login-form">
        <div className="login-welcome">
          <span className="mini-symbol">
            <Icon name="book" size={28} />
          </span>
          <span className="eyebrow">MAKE YOURSELF AT HOME</span>
          <h2>Welcome to the commons.</h2>
          <p>
            Your conversations, campus updates, and week ahead, all in one
            place.
          </p>
          {config.google_client_id ? (
            <div ref={google} className="google-signin" />
          ) : (
            <div className="google-note">
              <Icon name="shield" />
              <span>
                Campus accounts use <strong>@nsut.ac.in</strong>.<br />
                <small>
                  Google sign-in can be enabled by the app administrator.
                </small>
              </span>
            </div>
          )}
          {config.demo && (
            <>
              <div className="divider">
                <span>EXPLORE THE DEMO</span>
              </div>
              <button
                className="button primary full"
                disabled={!!busy}
                onClick={() => enter('student@nsut.ac.in')}
              >
                {busy === 'student@nsut.ac.in'
                  ? 'Opening campus…'
                  : 'Enter as a student'}
                <Icon name="arrow" />
              </button>
              <button
                className="button outline full"
                disabled={!!busy}
                onClick={() => enter('admin@nsut.ac.in')}
              >
                {busy === 'admin@nsut.ac.in'
                  ? 'Opening admin…'
                  : 'Explore as an admin'}
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
              A working prototype with sample campus data.
              <br />
              {isHostedDemo
                ? 'Your demo changes are saved in this browser.'
                : 'Your demo changes are saved on the local server.'}
            </p>
          )}
          <div className="login-foot">
            <span>BUILT FOR THE NSUT COMMUNITY</span>
            <span>01 / CONNECT</span>
          </div>
        </div>
      </section>
    </div>
  )
}
