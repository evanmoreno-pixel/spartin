import type { DatabaseSync } from 'node:sqlite'
import type { DemoAccount } from '../../../shared/contracts.js'

const phaseOneAccounts: ReadonlyArray<DemoAccount & { userId: string }> = [
  { accountKey: 'organizer-1', userId: 'demo-organizer-1', displayName: 'Organizer 1', role: 'organizer' },
  { accountKey: 'organizer-2', userId: 'demo-organizer-2', displayName: 'Organizer 2', role: 'organizer' },
  { accountKey: 'participant-1', userId: 'demo-participant-1', displayName: 'Participant 1', role: 'participant' },
]

const extraParticipants = [2, 3].map(number => ({
  accountKey: `participant-${number}`, userId: `demo-participant-${number}`,
  displayName: `Participant ${number}`, role: 'participant' as const,
}))

export const demoAccounts = [...phaseOneAccounts, ...extraParticipants]

function seedEvents(db: DatabaseSync) {
  const insertEvent = db.prepare(`
    INSERT INTO events (event_id, organizer_id, title, description, start_time, end_time,
      location, capacity, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', ?, ?)
  `)
  const events = [
    ['transfer-coffee', 0, 2, 18, 'Transfer Student Coffee Meetup', 'Meet other transfer students over coffee, swap campus tips, and get to know the Transfer Student Success Center.', 'Student Union, Room 1200', 24],
    ['library-study', 1, 4, 22, 'Library Study Jam', 'Bring an assignment and settle in for a quiet study session. We’ll take a short break to share study tips.', 'Dr. Martin Luther King, Jr. Library', 16],
    ['campus-walk', 0, 6, 20, 'Spartan Campus Walk', 'A relaxed walk covering campus landmarks, resource centers, and a few favorite places to decompress between classes.', 'Tower Hall Lawn', null],
    ['resume-workshop', 1, 8, 21, 'Resume Workshop', 'Bring a draft resume for peer feedback and leave with practical edits for your next internship application.', 'Career Center, Administration Building', 18],
    ['board-games', 0, 10, 23, 'Board Games at the Union', 'Drop by for quick card games and longer tabletop rounds. All experience levels are welcome.', 'Diaz Compean Student Union', 32],
  ] as const
  const now = new Date()
  for (const [id, organizer, day, hour, title, description, location, capacity] of events) {
    const startTime = new Date(now)
    startTime.setUTCDate(now.getUTCDate() + day)
    startTime.setUTCHours(hour, 0, 0, 0)
    const endTime = new Date(startTime.getTime() + 90 * 60_000)
    insertEvent.run(id, phaseOneAccounts[organizer].userId, title, description,
      startTime.toISOString(), endTime.toISOString(), location, capacity, now.toISOString(), now.toISOString())
  }
}

export function seedDemoData(db: DatabaseSync, legacySeedApplied: boolean) {
  const markSeed = db.prepare('INSERT OR IGNORE INTO demo_seed_history (name) VALUES (?)')
  const insertUser = db.prepare('INSERT INTO users (user_id, display_name, role) VALUES (?, ?, ?) ON CONFLICT (user_id) DO NOTHING')

  if (markSeed.run('phase-1').changes && !legacySeedApplied) {
    for (const { userId, displayName, role } of phaseOneAccounts) insertUser.run(userId, displayName, role)
    seedEvents(db)
  }
  if (markSeed.run('phase-2').changes) {
    for (const { userId, displayName, role } of extraParticipants) insertUser.run(userId, displayName, role)
  }
}
