import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { createApp } from './app.js'
import { openDatabase } from './data/database.js'

const port = Number(process.env.PORT ?? 3000)
const clientDirectory = resolve('dist/client')
const db = openDatabase(process.env.SPARTIN_DB ?? resolve('backend/data/spartin.sqlite'))
const app = createApp(db, { clientDirectory: existsSync(resolve(clientDirectory, 'index.html')) ? clientDirectory : undefined })
const server = app.listen(port, '127.0.0.1', () => console.info(`SpartIN API listening at http://127.0.0.1:${port}`))

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => server.close(() => db.close()))
}
