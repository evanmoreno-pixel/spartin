import { createApp } from '../../src/app.js'
import { openDatabase } from '../../src/data/database.js'

const db = openDatabase(process.argv[2])
const server = createApp(db).listen(0, '127.0.0.1', () => {
  const address = server.address()
  if (address && typeof address !== 'string') process.send?.(`http://127.0.0.1:${address.port}`)
})

process.once('disconnect', () => server.close(() => db.close()))
