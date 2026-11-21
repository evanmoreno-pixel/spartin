import { randomBytes } from 'node:crypto'
import type { DatabaseSync } from 'node:sqlite'
import { HttpError, objectBody } from '../api/httpError.js'
import { findUser } from '../data/database.js'
import { demoAccounts } from '../data/demoSeeds.js'

export const sessionCookie = 'spartin_demo_session'
export const sessionLifetimeMs = 8 * 60 * 60 * 1000

export class DemoSessions {
  private readonly sessions = new Map<string, { userId: string; expiresAt: number }>()

  constructor(private readonly db: DatabaseSync, private readonly now: () => number = Date.now) {}

  accounts() {
    return demoAccounts.map(({ accountKey, displayName, role }) => ({ accountKey, displayName, role }))
  }

  user(token: string | undefined) {
    if (!token) return
    const session = this.sessions.get(token)
    if (!session) return
    if (session.expiresAt <= this.now()) {
      this.sessions.delete(token)
      return
    }
    return findUser(this.db, session.userId)
  }

  signIn(body: unknown, existingToken?: string) {
    const input = objectBody(body)
    const account = demoAccounts.find(item => item.accountKey === input.accountKey)
    if (Object.keys(input).length !== 1 || !account) {
      throw new HttpError(400, 'INVALID_DEMO_ACCOUNT', 'Choose a predefined demo account.')
    }
    const user = findUser(this.db, account.userId)
    if (!user) throw new HttpError(404, 'DEMO_ACCOUNT_NOT_FOUND', 'This demo account is unavailable.')

    this.signOut(existingToken)
    const now = this.now()
    for (const [token, session] of this.sessions) {
      if (session.expiresAt <= now) this.sessions.delete(token)
    }
    const token = randomBytes(32).toString('base64url')
    this.sessions.set(token, { userId: user.userId, expiresAt: now + sessionLifetimeMs })
    return { token, user }
  }

  signOut(token: string | undefined) {
    if (token) this.sessions.delete(token)
  }
}
