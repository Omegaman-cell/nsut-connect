// Small display helpers shared by the screens.
export const categories = [
  'Academics',
  'Events',
  'Hackathons',
  'Campus',
  'Opportunities',
]
export const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
export const navigation = [
  ['feed', 'home', 'Campus feed'],
  ['discussions', 'chat', 'Discussions'],
  ['announcements', 'bell', 'Announcements'],
  ['timetable', 'calendar', 'My timetable'],
  ['saved', 'bookmark', 'Saved posts'],
]
export const todayName = () =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone: 'Asia/Kolkata',
  }).format(new Date())
export const initialDay = () =>
  days.includes(todayName()) ? todayName() : 'Monday'
export const initials = (name) =>
  name
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase() || 'NC'
export const date = (value) => {
  const d = new Date(
    value.includes('T') ? value : value.replace(' ', 'T') + '+05:30',
  )
  return Number.isNaN(d.getTime())
    ? 'Recently'
    : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}
export const categoryClass = (value) => value.toLowerCase()
