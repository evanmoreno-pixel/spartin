import { CalendarDays, ClipboardList, Compass, ShieldCheck, UsersRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import type { Role, User } from '../../shared/contracts'
import { ApiError, errorMessage, listAccounts, session, sessionEnded, signIn, signOut } from './api'
import { EventDashboard } from './EventDashboard'
import { EventDetailPage } from './EventDetail'
import { EventEditor } from './EventEditor'
import { ParticipantMapPage } from './EventLocations'
import { MyEvents } from './MyEvents'
import { ParticipantCalendar } from './ParticipantCalendar'
import { ParticipantDiscovery, ParticipantLayout } from './ParticipantDiscovery'
import { Brand, LoadError, Loading, Notice } from './ui'
import { useResource } from './useResource'

const homeFor = (role: Role) => role === 'organizer' ? '/organizer' : '/participant'

function DemoLogin({ onSignIn }: { onSignIn: (user: User) => void }) {
  const accounts = useResource(listAccounts)
  const [pendingAccount, setPendingAccount] = useState<string>()
  const [error, setError] = useState('')

  async function selectAccount(accountKey: string) {
    setPendingAccount(accountKey)
    setError('')
    try {
      onSignIn(await signIn(accountKey))
    } catch (failure) {
      setError(errorMessage(failure))
      setPendingAccount(undefined)
    }
  }

  return (
    <div className="login-layout">
      <section className="login-intro">
        <Brand />
        <div className="login-copy">
          <p className="campus-label">SAN JOSÉ STATE UNIVERSITY</p>
          <h1>Campus events <span>for transfer students.</span></h1>
          <p>Explore what’s happening at SJSU or organize a meetup of your own.</p>
        </div>
        <div className="login-foot"><CalendarDays size={19} aria-hidden="true" /> SpartIN · CMPE 131 term project</div>
      </section>
      <main className="login-main" id="main-content">
        <div className="login-content">
          <div className="demo-label"><ShieldCheck size={15} aria-hidden="true" /> Simulated authentication</div>
          <h2>Choose a demo account</h2>
          <p>Select an account to open its dashboard.</p>
          {error && <Notice error>{error}</Notice>}
          {accounts.pending && <Loading label="Loading demo accounts…" />}
          {!!accounts.error && <LoadError error={accounts.error} retry={accounts.refresh} />}
          <div className="account-list">
            {accounts.data?.map(account => {
              const Icon = account.role === 'organizer' ? ClipboardList : Compass
              return (
                <button type="button" className="account-option" key={account.accountKey}
                  onClick={() => void selectAccount(account.accountKey)} disabled={!!pendingAccount}>
                  <span className={`account-icon ${account.role}`}><Icon size={23} aria-hidden="true" /></span>
                  <span className="account-label">
                    <strong>{account.displayName}</strong>
                    <span>{account.role === 'organizer' ? 'Manage events you own' : 'Browse campus events'}</span>
                  </span>
                  {pendingAccount === account.accountKey && <span className="spinner" aria-label="Signing in" />}
                </button>
              )
            })}
          </div>
          <p className="demo-note">Demo accounts require no university credentials.</p>
        </div>
      </main>
    </div>
  )
}

function Shell({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function switchAccount() {
    setBusy(true)
    setError('')
    try {
      await signOut()
      onSignOut()
    } catch (failure) {
      setError(errorMessage(failure))
      setBusy(false)
    }
  }

  return (
    <div className="shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="topbar">
        <div className="topbar-inner">
          <Brand to={homeFor(user.role)} />
          <div className="account-nav">
            <div className="session-info"><strong>{user.displayName}</strong><span>Demo session</span></div>
            <button type="button" className="button secondary switch" disabled={busy} onClick={() => void switchAccount()}>
              <UsersRound size={16} aria-hidden="true" /> <span>{busy ? 'Switching…' : 'Switch account'}</span>
            </button>
          </div>
        </div>
      </header>
      <main className="page" id="main-content">
        {error && <Notice error>{error}</Notice>}
        <Outlet />
      </main>
      <footer className="footer"><span>SpartIN</span><span>San José State University · CMPE 131</span></footer>
    </div>
  )
}

function RoleRoute({ user, role }: { user: User; role: Role }) {
  return user.role === role ? <Outlet /> : <Navigate to={homeFor(user.role)} replace />
}

export function App() {
  const bootstrap = useResource(session)
  const [account, setAccount] = useState<User | null>()
  const user = account === undefined ? bootstrap.data : account

  useEffect(() => {
    const endSession = () => setAccount(null)
    window.addEventListener(sessionEnded, endSession)
    return () => window.removeEventListener(sessionEnded, endSession)
  }, [])

  if (account === undefined && bootstrap.pending) return <Loading label="Opening SpartIN…" />
  if (account === undefined && bootstrap.error && !(bootstrap.error instanceof ApiError && bootstrap.error.status === 401)) {
    return <LoadError error={bootstrap.error} retry={bootstrap.refresh} />
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={homeFor(user.role)} replace /> : <DemoLogin onSignIn={setAccount} />} />
      <Route path="events/:id" element={user
        ? <Shell user={user} onSignOut={() => setAccount(null)} />
        : <DemoLogin onSignIn={setAccount} />}>
        {user && <Route index element={<EventDetailPage user={user} organizer={false} />} />}
      </Route>
      {user && (
        <Route element={<Shell user={user} onSignOut={() => setAccount(null)} />}>
          <Route path="organizer" element={<RoleRoute user={user} role="organizer" />}>
            <Route index element={<EventDashboard organizer />} />
            <Route path="events/new" element={<EventEditor user={user} />} />
            <Route path="events/:id" element={<EventDetailPage user={user} organizer />} />
            <Route path="events/:id/edit" element={<EventEditor user={user} />} />
          </Route>
          <Route path="participant" element={<RoleRoute user={user} role="participant" />}>
            <Route element={<ParticipantLayout />}>
              <Route index element={<ParticipantDiscovery />} />
              <Route path="browse" element={<EventDashboard organizer={false} />} />
              <Route path="calendar" element={<ParticipantCalendar />} />
              <Route path="my-events" element={<MyEvents />} />
              <Route path="map" element={<ParticipantMapPage />} />
            </Route>
            <Route path="events/:id" element={<EventDetailPage user={user} organizer={false} />} />
          </Route>
        </Route>
      )}
      <Route path="*" element={<Navigate to={user ? homeFor(user.role) : '/'} replace />} />
    </Routes>
  )
}
