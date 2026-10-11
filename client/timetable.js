// Timetable choices stay on this device. The PDF uses CSE-1/CSE-2 sections.
export function sectionKey(userId, branch, semester) {
  return `nsut-section-${userId}-${branch}-${semester}`
}

export function sectionsFor(classes) {
  return [...new Set(classes.map((item) => item.section))]
}

export function selectedSection(userId, branch, semester, classes) {
  const choices = sectionsFor(classes)
  const saved = localStorage.getItem(sectionKey(userId, branch, semester))
  return choices.includes(saved) ? saved : choices[0]
}
