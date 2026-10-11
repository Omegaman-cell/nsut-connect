import Icon from './icons'

export default function ThemeButton({ theme, onToggle }) {
  const label =
    theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
  return (
    <button
      className="icon-button theme-toggle"
      onClick={onToggle}
      aria-label={label}
      title={label}
    >
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
    </button>
  )
}
