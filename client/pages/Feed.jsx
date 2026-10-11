import Icon from '../icons'
import { Avatar, Empty } from '../components'
import { date, initialDay, todayName } from '../helpers'

export default function Feed({ posts, announcements, upcoming, user, onNavigate, onOpenPost, onOpenNotice }) {
  const recent = [...posts].sort((a, b) => b.id - a.id).slice(0, 3)
  const [latest, next] = announcements
  return (
    <>
      <div className="welcome-heading">
        <span className="eyebrow">
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Kolkata',
          }).toUpperCase()}
        </span>
        <h1>Campus feed</h1>
      </div>
      <div className="overview-summary">
        <section className="overview-updates">
          <div className="rail-heading">
            <Icon name="pin" size={18} />
            <h2>Latest announcements</h2>
            <button aria-label="View all announcements" onClick={() => onNavigate('announcements')}>
              <Icon name="arrow" size={17} />
            </button>
          </div>
          <div className="overview-update-card">
            {latest ? (
              <button className="notice" onClick={() => onOpenNotice(latest)}>
                <div>
                  <span className="eyebrow">{latest.category}</span>
                  {latest.is_pinned && <Icon name="pin" size={15} />}
                </div>
                <h3>{latest.title}</h3>
                <p>{latest.content}</p>
                <div className="notice-bottom">
                  <small>{date(latest.created_at)}</small>
                  <Icon name="arrow" size={17} />
                </div>
              </button>
            ) : <Empty icon="bell" title="No announcements" />}
            {next && (
              <button className="overview-next-update" onClick={() => onOpenNotice(next)}>
                <span>{next.title}</span>
                <Icon name="arrow" size={17} />
              </button>
            )}
          </div>
        </section>
        <section className="overview-schedule">
          <div className="rail-heading">
            <Icon name="calendar" size={18} />
            <h2>{['Saturday', 'Sunday'].includes(todayName()) ? 'Next up: Monday' : 'Your day ahead'}</h2>
            <span className="tag">{user.branch}</span>
          </div>
          <div className="day-ahead">
            <div className="day-ahead-top">
              <span>{initialDay()}</span>
              <small>SEM {user.semester}</small>
            </div>
            {upcoming.slice(0, 3).map((item, index) => (
              <div className="mini-class" key={index}>
                <span className="timeline-dot" />
                <small>{item.time}</small>
                <strong>{item.subject.replace(/\s*\(.*\)/, '')}</strong>
                <span>{item.room}</span>
              </div>
            ))}
            {!upcoming.length && <p className="muted">No classes on this schedule.</p>}
            <button className="rail-link" onClick={() => onNavigate('timetable')}>
              Open full timetable <Icon name="arrow" size={17} />
            </button>
          </div>
        </section>
      </div>
      <section className="overview-conversations">
        <div className="feed-title-row">
          <h2>Recent conversations</h2>
          <button className="overview-link" onClick={() => onNavigate('discussions')}>
            View all discussions <Icon name="arrow" size={16} />
          </button>
        </div>
        <div className="recent-post-list">
          {recent.map((post) => (
            <button className="recent-post" key={post.id} onClick={() => onOpenPost(post.id)}>
              <Avatar name={post.author} />
              <div>
                <div className="recent-post-meta">
                  <span>{post.category}</span><span>{date(post.created_at)}</span>
                </div>
                <h3>{post.title}</h3>
                <p>{post.author} · {post.comments?.length || 0} replies</p>
              </div>
              <Icon name="arrow" size={18} />
            </button>
          ))}
          {!recent.length && <Empty icon="chat" title="No discussions yet" action={
            <button className="button outline" onClick={() => onNavigate('discussions')}>Start a discussion</button>
          } />}
        </div>
      </section>
    </>
  )
}
