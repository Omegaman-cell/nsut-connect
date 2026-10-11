// Use a saved choice, or the device preference on the first visit.
export function initialTheme() {
  const saved = localStorage.getItem('nsut-theme')
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}
