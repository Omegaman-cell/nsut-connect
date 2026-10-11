import { useState } from 'react'
import Icon from '../icons'
import { Empty } from '../components'
import { days, initialDay } from '../helpers'
import { sectionKey, selectedSection, sectionsFor } from '../timetable'

export default function Timetable({ tables, user, notify }) {
  const [branch, setBranch] = useState(user.branch || 'CSE')
  const [semester, setSemester] = useState(user.semester || '1')
  const [day, setDay] = useState(initialDay)
  const [view, setView] = useState('day')
  const semesters = Object.keys(tables[branch] || {})
  const allClasses = tables[branch]?.[semester] || []
  const sections = sectionsFor(allClasses)
  const [sectionChoice, setSectionChoice] = useState(() =>
    selectedSection(user.id, branch, semester, allClasses),
  )
  const section = sections.includes(sectionChoice) ? sectionChoice : sections[0]
  const schedule = allClasses.filter((item) => item.section === section)
  function changeSection(value) {
    setSectionChoice(value)
    localStorage.setItem(sectionKey(user.id, branch, semester), value)
  }
  function changeBranch(value) {
    setBranch(value)
    const nextSemester = Object.keys(tables[value] || {})[0] || '1'
    setSemester(nextSemester)
    setSectionChoice(
      selectedSection(
        user.id,
        value,
        nextSemester,
        tables[value]?.[nextSemester] || [],
      ),
    )
  }
  function download() {
    const csv = [
      'Day,Time,Subject,Room,Faculty,Slot,Section',
      ...schedule.map((c) =>
        [c.day, c.time, c.subject, c.room, c.faculty, c.slot, c.section]
          .map((v) => '"' + v.replaceAll('"', '""') + '"')
          .join(','),
      ),
    ].join('\r\n')
    const url = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8;' }),
    )
    const a = document.createElement('a')
    a.href = url
    a.download = `NSUT-${branch}-semester-${semester}.csv`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    notify('Timetable downloaded.')
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Timetable</h1>
          <p>July–December 2026</p>
        </div>
        <button
          className="button outline"
          onClick={download}
          disabled={!schedule.length}
        >
          <Icon name="download" size={17} />
          Download
        </button>
      </div>
      <section className="schedule-panel">
        <div className="schedule-toolbar">
          <div className="schedule-selects">
            <label>
              Branch
              <select
                value={branch}
                onChange={(e) => changeBranch(e.target.value)}
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
                onChange={(e) => {
                  setSemester(e.target.value)
                  setSectionChoice(
                    selectedSection(
                      user.id,
                      branch,
                      e.target.value,
                      tables[branch]?.[e.target.value] || [],
                    ),
                  )
                }}
              >
                {semesters.map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </label>
            {sections.length > 1 && (
              <label>
                Section
                <select
                  value={section}
                  onChange={(e) => changeSection(e.target.value)}
                >
                  {sections.map((value) => (
                    <option key={value} value={value}>
                      {branch}-{value}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
          <div className="segmented">
            <button
              className={view === 'day' ? 'selected' : ''}
              onClick={() => setView('day')}
            >
              Day
            </button>
            <button
              className={view === 'week' ? 'selected' : ''}
              onClick={() => setView('week')}
            >
              Week
            </button>
          </div>
        </div>
        {view === 'day' ? (
          <>
            <div className="day-tabs">
              {days.map((d) => (
                <button
                  key={d}
                  className={d === day ? 'selected' : ''}
                  onClick={() => setDay(d)}
                >
                  {d.slice(0, 3)}
                  <span>
                    {schedule.filter((c) => c.day === d).length} classes
                  </span>
                </button>
              ))}
            </div>
            <div className="schedule-day-heading">
              <h2>{day}</h2>
              <span>
                {schedule.filter((c) => c.day === day).length} on your schedule
              </span>
            </div>
            <div className="class-list">
              {schedule
                .filter((c) => c.day === day)
                .map((c, i) => (
                  <div className="class-row" key={i}>
                    <div className="class-time">
                      <Icon name="clock" size={17} />
                      {c.time}
                    </div>
                    <div
                      className={
                        'class-content ' +
                        (c.subject.includes('Lab') ? 'lab' : '')
                      }
                    >
                      <span className="eyebrow">
                        {c.kind.toUpperCase()} · {c.slot}
                      </span>
                      <h3>{c.subject}</h3>
                      <div>
                        <span>
                          <Icon name="location" size={14} />
                          {c.room}
                        </span>
                        <span>
                          <Icon name="user" size={14} />
                          {c.faculty}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              {!schedule.some((c) => c.day === day) && (
                <Empty
                  icon="sun"
                  title="No classes"
                  description="Nothing scheduled for this day."
                />
              )}
            </div>
          </>
        ) : (
          <div className="week-grid">
            {days.map((d) => (
              <div className="week-column" key={d}>
                <h3>{d}</h3>
                {schedule
                  .filter((c) => c.day === d)
                  .map((c, i) => (
                    <div
                      className={
                        'week-class ' + (c.subject.includes('Lab') ? 'lab' : '')
                      }
                      key={i}
                    >
                      <small>{c.time}</small>
                      <strong>{c.subject}</strong>
                      <span>
                        {c.room} · {c.faculty}
                      </span>
                    </div>
                  ))}
                {!schedule.some((c) => c.day === d) && (
                  <p className="muted">No classes</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
