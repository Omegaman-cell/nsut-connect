// Every screen uses the server API. Browser storage holds display state only.
export const session = () => {
  try {
    const value = JSON.parse(localStorage.getItem('nsut-session') || 'null')
    return value?.token && value.token !== 'demo' ? value : null
  } catch { return null }
}
export function storeSession(value) {
  if (value) localStorage.setItem('nsut-session', JSON.stringify(value))
  else localStorage.removeItem('nsut-session')
}
export async function api(path, method = 'GET', body) {
  let response
  try {
    response = await fetch('/api' + path, {
      method,
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        ...(session()?.token && session().token !== 'cookie' ? { Authorization: 'Bearer ' + session().token } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
  } catch {
    throw new Error(
      'Cannot reach the campus server. Please try again.',
    )
  }
  let result
  try {
    result = await response.json()
  } catch {
    throw new Error(
      'The campus server is unavailable. Please try again.',
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
