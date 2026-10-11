import { existsSync, cpSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

// In the GitHub project, frontend/src is the editable UI. Sites receives the
// prepared hosted folder alone, so its client copy is used there unchanged.
const hosted = fileURLToPath(new URL('../', import.meta.url))
const frontend = path.resolve(hosted, '../frontend')
if (existsSync(path.join(frontend, 'src/App.jsx'))) {
  cpSync(path.join(frontend, 'src'), path.join(hosted, 'client'), { recursive: true })
  cpSync(path.join(frontend, 'public/seed.json'), path.join(hosted, 'server/seed.json'))
}
