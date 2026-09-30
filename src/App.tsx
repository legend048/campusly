import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Bookmark,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Compass,
  Heart,
  LayoutDashboard,
  LayoutGrid,
  List,
  MapPin,
  Menu,
  Moon,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Sprout,
  Sun,
  Ticket,
  Users,
  X,
} from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Avatars,
  Brand,
  CategoryIcon,
  EmptyState,
  EventCard,
  Modal,
  TicketCard,
  addToCalendar,
} from './components'
import {
  CalendarPage,
  ClubsPage,
  DashboardPage,
  EventForm,
  ProfileForm,
  RegistrationForm,
} from './pages'
import { categories, clubs, dateLabel, initials, priceLabel, seedEvents, timeLabel } from './data'
import type { CampusEvent, Category, Profile, Registration } from './data'
import { downloadFile, useLocalStorage } from './hooks'

gsap.registerPlugin(ScrollTrigger)

type Page = 'discover' | 'calendar' | 'tickets' | 'saved' | 'clubs' | 'dashboard'
type Dialog =
  | { type: 'event'; id: string }
  | { type: 'register'; id: string }
  | { type: 'ticket'; id: string }
  | { type: 'create' }
  | { type: 'edit'; id: string }
  | { type: 'delete'; id: string }
  | { type: 'cancel'; id: string }
  | { type: 'profile' }
  | { type: 'help' }
const navItems: { id: Page; label: string; icon: typeof Compass }[] = [
  { id: 'discover', label: 'Discover', icon: Compass },
  { id: 'calendar', label: 'Event calendar', icon: CalendarDays },
  { id: 'tickets', label: 'My tickets', icon: Ticket },
  { id: 'saved', label: 'Saved events', icon: Bookmark },
  { id: 'clubs', label: 'Communities', icon: Users },
]
const readPage = (): Page => {
  const hash = window.location.hash.slice(1)
  return ['discover', 'calendar', 'tickets', 'saved', 'clubs', 'dashboard'].includes(hash)
    ? (hash as Page)
    : 'discover'
}
const fallbackProfile = {
  name: 'Alex Morgan',
  email: 'alex@northwood.edu',
  course: 'Computer Science · Year 4',
  campus: 'Northwood University',
}

export default function App() {
  const [page, setPage] = useState<Page>(readPage)
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('campusly-theme', 'light')
  const [events, setEvents] = useLocalStorage<CampusEvent[]>('campusly-events-v1', seedEvents)
  const [saved, setSaved] = useLocalStorage<string[]>('campusly-saved', [])
  const [registrations, setRegistrations] = useLocalStorage<Registration[]>(
    'campusly-registrations',
    [],
  )
  const [joined, setJoined] = useLocalStorage<string[]>('campusly-clubs', [])
  const [profile, setProfile] = useLocalStorage<Profile>('campusly-profile', fallbackProfile)
  const [notificationsRead, setNotificationsRead] = useLocalStorage<boolean>(
    'campusly-notifications-read',
    false,
  )
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category | 'All events'>('All events')
  const [dateFilter, setDateFilter] = useState('all')
  const [sort, setSort] = useState('soonest')
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')
  const [organizer, setOrganizer] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [freeOnly, setFreeOnly] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [dialog, setDialog] = useState<Dialog | null>(null)
  const [toast, setToast] = useState('')
  const appRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLElement>(null)
  const mobileToggleRef = useRef<HTMLButtonElement>(null)
  const featured = events.find((event) => event.featured) || seedEvents[0]
  const upcoming = useMemo(
    () =>
      [...events]
        .filter((event) => new Date(`${event.date}T${event.time}:00`) >= new Date())
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    [events],
  )

  const navigate = (target: Page) => {
    setPage(target)
    window.location.hash = target
    setMobileOpen(false)
    setNotificationsOpen(false)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
  const notify = (message: string) => setToast(message)
  const openEvent = (event: CampusEvent) => setDialog({ type: 'event', id: event.id })
  const closeDialog = () => setDialog(null)
  const toggleSave = (event: CampusEvent) => {
    const exists = saved.includes(event.id)
    setSaved((current) =>
      exists ? current.filter((id) => id !== event.id) : [...current, event.id],
    )
    notify(exists ? 'Removed from your saved events.' : 'Saved. A good plan for another day.')
  }
  const resetFilters = () => {
    setQuery('')
    setCategory('All events')
    setDateFilter('all')
    setFreeOnly(false)
    setOrganizer('')
    setSort('soonest')
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#151c18' : '#234a39')
  }, [theme])
  useEffect(() => {
    const handler = () => setPage(readPage())
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])
  useEffect(() => {
    if (!toast) return
    const timeout = setTimeout(() => setToast(''), 4200)
    return () => clearTimeout(timeout)
  }, [toast])
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (
        ((event.ctrlKey || event.metaKey) && event.key === 'k') ||
        (event.key === '/' &&
          !['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement).tagName))
      ) {
        if (dialog) return
        event.preventDefault()
        searchRef.current?.focus()
      }
      if (event.key === 'Escape') {
        setMobileOpen(false)
        setNotificationsOpen(false)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [dialog])
  useEffect(() => {
    if (!notificationsOpen) return
    const handler = (event: PointerEvent) => {
      if (!notificationsRef.current?.contains(event.target as Node)) setNotificationsOpen(false)
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [notificationsOpen])
  useEffect(() => {
    if (!mobileOpen) return
    const panel = mobileMenuRef.current!
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const controls = panel.querySelectorAll<HTMLElement>('button, a, input, [tabindex="0"]')
    controls[0]?.focus()
    const handler = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
    panel.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = previousOverflow
      panel.removeEventListener('keydown', handler)
      mobileToggleRef.current?.focus()
    }
  }, [mobileOpen])
  useLayoutEffect(() => {
    const matchMedia = gsap.matchMedia()
    matchMedia.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        gsap.fromTo(
          '.page-heading > *',
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out' },
        )
        gsap.fromTo(
          '.hero-copy > *',
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.85, stagger: 0.1, ease: 'power3.out', delay: 0.1 },
        )
        gsap.fromTo('.hero-image', { scale: 1.08 }, { scale: 1, duration: 1.7, ease: 'power2.out' })
        gsap.to('.hero-sticker', {
          rotation: 10,
          y: -8,
          duration: 3,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        })
        gsap.utils.toArray<HTMLElement>('.reveal').forEach((element, index) => {
          gsap.fromTo(
            element,
            { opacity: 0, y: 25 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              delay: (index % 3) * 0.055,
              ease: 'power2.out',
              scrollTrigger: { trigger: element, start: 'top 96%', once: true },
            },
          )
        })
      }, appRef)
      return () => context.revert()
    })
    return () => matchMedia.revert()
  }, [
    page,
    query,
    category,
    dateFilter,
    freeOnly,
    sort,
    layout,
    organizer,
    events.length,
    saved.length,
    registrations.length,
  ])

  const filtered = useMemo(() => {
    const now = new Date()
    const weekendStart = new Date(now)
    weekendStart.setHours(0, 0, 0, 0)
    weekendStart.setDate(now.getDate() + ((6 - now.getDay() + 7) % 7))
    if (now.getDay() === 0) weekendStart.setDate(now.getDate() - 1)
    const weekendEnd = new Date(weekendStart)
    weekendEnd.setDate(weekendEnd.getDate() + 2)
    return events
      .filter((event) => {
        const date = new Date(event.date + 'T' + event.time)
        const matchesDate =
          dateFilter === 'all' ||
          (dateFilter === 'weekend' && date >= weekendStart && date < weekendEnd) ||
          (dateFilter === 'month' &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()) ||
          (dateFilter === 'next30' &&
            date >= now &&
            date <= new Date(now.getTime() + 30 * 86400000))
        return (
          (page !== 'saved' || saved.includes(event.id)) &&
          (category === 'All events' || event.category === category) &&
          (!freeOnly || !event.price) &&
          (!organizer || event.organizer === organizer) &&
          matchesDate &&
          `${event.title} ${event.category} ${event.venue} ${event.organizer}`
            .toLowerCase()
            .includes(query.toLowerCase().trim())
        )
      })
      .sort((a, b) =>
        sort === 'popular'
          ? b.attendees - a.attendees
          : sort === 'price'
            ? a.price - b.price
            : (a.date + a.time).localeCompare(b.date + b.time),
      )
  }, [events, page, saved, category, freeOnly, organizer, dateFilter, query, sort])

  const selectedEvent =
    dialog && 'id' in dialog ? events.find((event) => event.id === dialog.id) : undefined
  const selectedRegistration =
    dialog?.type === 'ticket' || dialog?.type === 'cancel'
      ? registrations.find((reg) => reg.id === dialog.id)
      : undefined
  const ticketEvent = selectedRegistration
    ? events.find((event) => event.id === selectedRegistration.eventId)
    : undefined
  const alreadyRegistered =
    selectedEvent && registrations.find((reg) => reg.eventId === selectedEvent.id)
  const handleRegistration = (details: Pick<Registration, 'name' | 'email' | 'course'>) => {
    if (!selectedEvent || registrations.some((reg) => reg.eventId === selectedEvent.id)) return
    if (
      selectedEvent.attendees >= selectedEvent.capacity ||
      new Date(`${selectedEvent.date}T${selectedEvent.time}`) <= new Date()
    ) {
      notify('Registration is no longer available for this event.')
      setDialog({ type: 'event', id: selectedEvent.id })
      return
    }
    const registration = {
      ...details,
      eventId: selectedEvent.id,
      id: `CP-${crypto.randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase()}`,
      registeredAt: new Date().toISOString(),
    }
    setRegistrations((current) => [...current, registration])
    setDialog({ type: 'ticket', id: registration.id })
    notify('You’re on the list! Let the countdown begin.')
  }
  const saveEvent = (event: CampusEvent) => {
    setEvents((current) =>
      current.some((item) => item.id === event.id)
        ? current.map((item) => (item.id === event.id ? event : item))
        : [...current, event],
    )
    closeDialog()
    navigate('dashboard')
    notify(
      dialog?.type === 'edit'
        ? 'Your event is up to date.'
        : 'It’s happening! Your event is published.',
    )
  }
  const downloadTicket = (registration: Registration, event: CampusEvent) => {
    downloadFile(
      [
        'CAMPUSLY — EVENT PASS',
        '',
        event.title,
        `Date: ${dateLabel(event.date, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
        `Time: ${timeLabel(event.time)}`,
        `Venue: ${event.venue}`,
        '',
        `Guest: ${registration.name}`,
        `Course: ${registration.course}`,
        `Booking reference: ${registration.id}`,
        `Entry: ${event.price ? `${priceLabel(event.price)} — payable at the venue` : 'Free'}`,
        '',
        'Please bring your student ID and arrive 15 minutes early.',
        'This pass is a local Campusly demo registration.',
      ].join('\r\n'),
      `${registration.id}-pass.txt`,
      'text/plain;charset=utf-8',
    )
    notify('Your event pass has been downloaded.')
  }

  const renderFilters = () => (
    <>
      <div className="event-controls">
        <div className="category-tabs" aria-label="Event categories">
          {(['All events', ...categories] as const).map((cat) => (
            <button
              key={cat}
              className={category === cat ? 'active' : ''}
              onClick={() => setCategory(cat)}
              aria-pressed={category === cat}
            >
              {cat === 'All events' ? <LayoutGrid size={15} /> : <CategoryIcon category={cat} />}
              {cat}
            </button>
          ))}
        </div>
        <button
          className={`filter-toggle icon-button ${showFilters || freeOnly ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
          aria-label="More filters"
          aria-expanded={showFilters}
        >
          <SlidersHorizontal size={18} />
          {freeOnly && <i />}
        </button>
      </div>
      {showFilters && (
        <div className="advanced-filters">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={freeOnly}
              onChange={(e) => setFreeOnly(e.target.checked)}
            />
            Free events only
          </label>
          <label className="sort-label">
            Sort by
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="soonest">Happening soonest</option>
              <option value="popular">Most popular</option>
              <option value="price">Price: low to high</option>
            </select>
          </label>
          <button className="text-button" onClick={resetFilters}>
            Reset filters
          </button>
        </div>
      )}
      <div className="results-toolbar">
        <span>
          {filtered.length}{' '}
          {query || category !== 'All events' || organizer || freeOnly || dateFilter !== 'all'
            ? 'matching'
            : page === 'saved'
              ? 'saved'
              : 'upcoming'}{' '}
          events <span className="results-extra">· Find something that feels like you</span>
        </span>
        <div className="view-controls">
          <label className="date-filter">
            <CalendarDays size={14} />
            <select
              aria-label="Filter by date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">Any date</option>
              <option value="weekend">This weekend</option>
              <option value="month">This month</option>
              <option value="next30">Next 30 days</option>
            </select>
            <ChevronDown size={12} />
          </label>
          <span className="view-divider" />
          <button
            className={`icon-button ${layout === 'grid' ? 'selected' : ''}`}
            aria-label="Grid view"
            aria-pressed={layout === 'grid'}
            onClick={() => setLayout('grid')}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            className={`icon-button ${layout === 'list' ? 'selected' : ''}`}
            aria-label="List view"
            aria-pressed={layout === 'list'}
            onClick={() => setLayout('list')}
          >
            <List size={18} />
          </button>
        </div>
      </div>
      {(organizer || query) && (
        <div className="active-search">
          {organizer ? `Events by ${organizer}` : `Results for “${query}”`}
          <button
            className="text-button"
            onClick={() => {
              setOrganizer('')
              setQuery('')
            }}
          >
            <X size={13} />
            Clear
          </button>
        </div>
      )}
    </>
  )
  const renderCards = () =>
    filtered.length ? (
      <div className={`events-grid ${layout === 'list' ? 'list-view' : ''}`}>
        {filtered.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            saved={saved.includes(event.id)}
            registered={registrations.some((reg) => reg.eventId === event.id)}
            onSave={() => toggleSave(event)}
            onOpen={() => openEvent(event)}
            list={layout === 'list'}
          />
        ))}
      </div>
    ) : (
      <EmptyState
        icon={page === 'saved' ? <Bookmark size={28} /> : <Search size={28} />}
        title={
          page === 'saved' && !saved.length
            ? 'Save a little possibility.'
            : 'Nothing here just yet.'
        }
        description={
          page === 'saved' && !saved.length
            ? 'Tap the bookmark on an event to keep your next good plan close.'
            : 'Try another category, date, or search. Your next good story is out there.'
        }
        action={page === 'saved' && !saved.length ? 'Discover events' : 'Clear filters'}
        onAction={() => {
          resetFilters()
          if (page === 'saved' && !saved.length) navigate('discover')
        }}
      />
    )

  return (
    <div className="app" ref={appRef}>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('main-content')?.focus()
        }}
      >
        Skip to content
      </a>
      {mobileOpen && <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />}
      <aside
        className={`sidebar ${mobileOpen ? 'open' : ''}`}
        ref={mobileMenuRef}
        aria-label="Main navigation"
        {...(mobileOpen ? { role: 'dialog', 'aria-modal': true } : {})}
      >
        <div className="sidebar-brand">
          <button onClick={() => navigate('discover')} aria-label="Campusly home">
            <Brand />
          </button>
          <button
            className="icon-button mobile-close"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <button
          className="campus-selector"
          onClick={() => {
            setMobileOpen(false)
            setDialog({ type: 'profile' })
          }}
        >
          <span className="campus-icon">
            <Sprout size={17} />
          </span>
          <span>
            <small>YOUR CAMPUS</small>
            <strong>{profile.campus}</strong>
          </span>
          <ChevronDown size={13} />
        </button>
        <span className="nav-label">YOUR CAMPUS LIFE</span>
        <nav>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => {
                if (item.id === 'saved' || item.id === 'discover') resetFilters()
                navigate(item.id)
              }}
              aria-current={page === item.id ? 'page' : undefined}
            >
              <item.icon size={19} strokeWidth={1.7} />
              <span>{item.label}</span>
              {item.id === 'tickets' && registrations.length > 0 && <b>{registrations.length}</b>}
              {item.id === 'saved' && saved.length > 0 && <b>{saved.length}</b>}
              {item.id === 'discover' && <span className="nav-active-dot" />}
            </button>
          ))}
        </nav>
        <span className="nav-label organize-label">MAKE IT HAPPEN</span>
        <button
          className={`nav-item ${page === 'dashboard' ? 'active' : ''}`}
          onClick={() => navigate('dashboard')}
          aria-current={page === 'dashboard' ? 'page' : undefined}
        >
          <LayoutDashboard size={19} strokeWidth={1.7} />
          <span>Organizer space</span>
          <ArrowUpRight size={14} />
        </button>
        <div className="sidebar-bottom">
          <div className="host-prompt">
            <span className="host-spark" aria-hidden="true">
              ✳
            </span>
            <h3>Got a big idea?</h3>
            <p>
              Turn “what if” into
              <br />
              “you had to be there.”
            </p>
            <button
              onClick={() => {
                setMobileOpen(false)
                setDialog({ type: 'create' })
              }}
            >
              Host an event
              <Plus size={16} />
            </button>
            <span className="host-decoration" />
          </div>
          <button
            className="help-link"
            onClick={() => {
              setMobileOpen(false)
              setDialog({ type: 'help' })
            }}
          >
            <CircleHelp size={17} />A little help?
            <ArrowUpRight size={14} />
          </button>
          <div className="theme-switch" aria-label="Color theme">
            <button
              className={theme === 'light' ? 'active' : ''}
              aria-pressed={theme === 'light'}
              onClick={() => setTheme('light')}
            >
              <Sun size={15} />
              Light
            </button>
            <button
              className={theme === 'dark' ? 'active' : ''}
              aria-pressed={theme === 'dark'}
              onClick={() => setTheme('dark')}
            >
              <Moon size={14} />
              Dark
            </button>
          </div>
          <div className="sidebar-footer">
            <span className="online-dot" />A little more campus. A little more you.
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="topbar-left">
            <button
              ref={mobileToggleRef}
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={23} />
            </button>
            <span className="topbar-tagline">
              <span className="small-star">✳</span>Your campus, all happening.
            </span>
            <span className="mobile-brand">
              <Brand compact />
            </span>
          </div>
          <div className="topbar-actions">
            <label className="global-search">
              <Search size={17} />
              <input
                ref={searchRef}
                value={query}
                aria-label="Search events"
                placeholder="Search something good..."
                onChange={(e) => {
                  setQuery(e.target.value)
                  if (page !== 'discover' && page !== 'saved') navigate('discover')
                }}
              />
              <kbd>⌘ K</kbd>
              {query && (
                <button
                  className="search-clear"
                  aria-label="Clear search"
                  onClick={() => setQuery('')}
                >
                  <X size={14} />
                </button>
              )}
            </label>
            <div className="notification-wrapper" ref={notificationsRef}>
              <button
                className={`notification-button icon-button ${notificationsOpen ? 'active' : ''}`}
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <Bell size={19} />
                {!notificationsRead && <i />}
              </button>
              {notificationsOpen && (
                <div className="notifications-panel">
                  <div className="notifications-heading">
                    <h3>The campus buzz</h3>
                    <button
                      className="icon-button"
                      aria-label="Mark all notifications as read"
                      onClick={() => {
                        setNotificationsRead(true)
                        notify('All caught up. Good things ahead.')
                      }}
                    >
                      <CheckCheck size={18} />
                    </button>
                  </div>
                  <p className="notification-note">
                    {notificationsRead
                      ? 'You’re all caught up. Here’s what’s next.'
                      : 'A few good things coming your way.'}
                  </p>
                  {upcoming.slice(0, 3).map((event) => (
                    <button
                      className="notification-item"
                      key={event.id}
                      onClick={() => {
                        setNotificationsOpen(false)
                        setNotificationsRead(true)
                        openEvent(event)
                      }}
                    >
                      <span>
                        <CategoryIcon category={event.category} size={18} />
                      </span>
                      <div>
                        <strong>{event.title}</strong>
                        <small>
                          {dateLabel(event.date)} · {timeLabel(event.time)}
                        </small>
                      </div>
                      <ChevronRight size={15} />
                    </button>
                  ))}
                  {!upcoming.length && (
                    <p className="notification-note">
                      New events will appear here as they’re published.
                    </p>
                  )}
                  <button className="notifications-footer" onClick={() => navigate('calendar')}>
                    See the campus calendar
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </div>
            <span className="topbar-divider" />
            <button
              className="profile-button"
              aria-label="Edit your profile"
              onClick={() => setDialog({ type: 'profile' })}
            >
              <span className="profile-avatar">{initials(profile.name)}</span>
              <span>
                <strong>{profile.name}</strong>
                <small>Student account</small>
              </span>
              <ChevronDown size={13} />
            </button>
          </div>
        </header>
        <main id="main-content" tabIndex={-1} className="main-content">
          {page === 'discover' && (
            <>
              <div className="page-heading discover-heading">
                <div>
                  <span className="greeting">
                    HEY {profile.name.split(' ')[0].toUpperCase()}, <Sun size={13} /> GOOD TO SEE
                    YOU
                  </span>
                  <h1>
                    Find your next good story<span className="heading-period">.</span>
                  </h1>
                  <p>The best part of college happens beyond the classroom.</p>
                </div>
                <span className="heading-chip campus-live">
                  <span className="online-dot" />
                  Campus is buzzing
                </span>
              </div>
              {!query && !organizer && (
                <>
                  <section
                    className="featured-hero"
                    ref={heroRef}
                    aria-label="Featured cultural festival"
                  >
                    <img
                      className="hero-image"
                      src={featured.image}
                      alt="A crowd celebrating at a live music festival under glowing stage lights"
                      fetchPriority="high"
                    />
                    <div className="hero-shade" />
                    <div className="hero-copy">
                      <span className="hero-eyebrow">
                        <span className="live-dot" />
                        THE CAMPUS IS CALLING
                      </span>
                      <h2>
                        Less scrolling.
                        <br />
                        More showing up.
                      </h2>
                      <p>
                        Live music. Your favorite people.
                        <br className="mobile-break" /> A whole lot of memories.
                      </p>
                      <button className="button lime" onClick={() => openEvent(featured)}>
                        Explore the festival
                        <ArrowUpRight size={18} />
                      </button>
                      <div className="hero-social">
                        <Avatars count={featured.attendees} />
                        <span>Don’t just hear about it.</span>
                      </div>
                    </div>
                    <div className="hero-sticker" aria-hidden="true">
                      <span>GOOD</span>
                      <strong>TIMES</strong>
                      <span>AHEAD ↗</span>
                    </div>
                    <div className="hero-bottom">
                      <div className="featured-event-name">
                        <span>THE BIG ONE</span>
                        <strong>
                          Prism ’26<span> / </span>Annual Cultural Fest
                        </strong>
                      </div>
                      <span className="hero-event-date">
                        <CalendarDays size={16} />
                        OCT 16–18
                        <em /> <MapPin size={16} />
                        CENTRAL GROUNDS
                      </span>
                      <button
                        className="hero-arrow"
                        aria-label={`View ${featured.title}`}
                        onClick={() => openEvent(featured)}
                      >
                        <ArrowUpRight size={23} />
                      </button>
                    </div>
                  </section>
                  <div className="campus-pulse reveal">
                    <div>
                      <span className="pulse-icon">
                        <CalendarDays size={19} />
                      </span>
                      <strong>
                        {upcoming.length}
                        <span>upcoming experiences</span>
                      </strong>
                    </div>
                    <span className="pulse-line" />
                    <div>
                      <span className="pulse-icon">
                        <Users size={20} />
                      </span>
                      <strong>
                        {clubs.length}
                        <span>student communities</span>
                      </strong>
                    </div>
                    <span className="pulse-line" />
                    <div>
                      <span className="pulse-icon">
                        <Heart size={19} />
                      </span>
                      <strong>
                        1 campus<span>endless possibilities</span>
                      </strong>
                    </div>
                    <button className="pulse-link" onClick={() => navigate('clubs')}>
                      Find your people
                      <ArrowUpRight size={16} />
                    </button>
                  </div>
                </>
              )}
              <section className="discover-events" id="events">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">GO ON, MAKE A PLAN</span>
                    <h2>
                      Your kind of happening<span className="heading-period">.</span>
                    </h2>
                  </div>
                  <button
                    className="text-button calendar-link"
                    onClick={() => navigate('calendar')}
                  >
                    View calendar
                    <ArrowUpRight size={16} />
                  </button>
                </div>
                {renderFilters()}
                {renderCards()}
              </section>
              <section className="community-callout reveal">
                <span className="callout-spark" aria-hidden="true">
                  ✳
                </span>
                <div>
                  <span className="eyebrow">YOUR PEOPLE ARE HERE</span>
                  <h2>
                    Same interests. New faces.
                    <br />
                    Really good company.
                  </h2>
                  <p>Find a community that makes campus feel a little more like you.</p>
                </div>
                <button className="button primary" onClick={() => navigate('clubs')}>
                  Meet the communities
                  <ArrowUpRight size={17} />
                </button>
                <span className="callout-doodle" aria-hidden="true">
                  hello,
                  <br />
                  <em>friend.</em>
                </span>
              </section>
            </>
          )}
          {page === 'calendar' && <CalendarPage events={events} onOpen={openEvent} />}
          {page === 'clubs' && (
            <ClubsPage
              joined={joined}
              onJoin={(id) => {
                const exists = joined.includes(id)
                setJoined((current) =>
                  exists ? current.filter((item) => item !== id) : [...current, id],
                )
                notify(
                  exists
                    ? 'You’ve left this community. You’re always welcome back.'
                    : 'You’re in! Say hello to your new community.',
                )
              }}
              onExplore={(club) => {
                resetFilters()
                setOrganizer(club)
                navigate('discover')
              }}
            />
          )}
          {page === 'saved' && (
            <>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">KEEP THE GOOD ONES CLOSE</span>
                  <h1>A few plans for later.</h1>
                  <p>All the events you’ve got your eye on, in one happy place.</p>
                </div>
                <span className="heading-chip">
                  <Bookmark size={15} />
                  {saved.length} saved for you
                </span>
              </div>
              {renderFilters()}
              {renderCards()}
            </>
          )}
          {page === 'tickets' && (
            <>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">YOUR PLANS ARE LOOKING GOOD</span>
                  <h1>
                    You had to be there.
                    <br />
                    And you will be.
                  </h1>
                  <p>Your registrations and event passes, ready when you are.</p>
                </div>
                <span className="heading-chip">
                  <Ticket size={16} />
                  {registrations.length} {registrations.length === 1 ? 'good plan' : 'good plans'}
                </span>
              </div>
              {registrations.length ? (
                <div className="tickets-list">
                  {[...registrations]
                    .sort((a, b) =>
                      (events.find((event) => event.id === a.eventId)?.date || '').localeCompare(
                        events.find((event) => event.id === b.eventId)?.date || '',
                      ),
                    )
                    .map((registration) => {
                      const event = events.find((item) => item.id === registration.eventId)
                      return (
                        event && (
                          <TicketCard
                            key={registration.id}
                            registration={registration}
                            event={event}
                            onOpen={() => setDialog({ type: 'ticket', id: registration.id })}
                            onCancel={() => setDialog({ type: 'cancel', id: registration.id })}
                          />
                        )
                      )
                    })}
                </div>
              ) : (
                <EmptyState
                  icon={<Ticket size={30} />}
                  title="Let’s put something on the calendar."
                  description="Find an event you love and grab your spot. Your pass will be waiting right here."
                  action="Find your next event"
                  onAction={() => {
                    resetFilters()
                    navigate('discover')
                  }}
                />
              )}
              <div className="ticket-tip">
                <Sparkles size={18} />
                <p>
                  A little heads-up: bring your student ID and arrive 15 minutes early. Good times
                  don’t like waiting.
                </p>
              </div>
            </>
          )}
          {page === 'dashboard' && (
            <DashboardPage
              events={events}
              registrations={registrations}
              onCreate={() => setDialog({ type: 'create' })}
              onEdit={(event) => setDialog({ type: 'edit', id: event.id })}
              onDelete={(event) => setDialog({ type: 'delete', id: event.id })}
              onOpen={openEvent}
            />
          )}
          <footer className="page-footer">
            <span>
              Made for your campus. <Heart size={11} /> Made for your moments.
            </span>
            <span>
              © {new Date().getFullYear()} Campusly <i>·</i> Campus demo
            </span>
          </footer>
        </main>
      </div>
      <div className={`toast ${toast ? 'visible' : ''}`} role="status" aria-live="polite">
        {toast && (
          <>
            <span>
              <Check size={15} />
            </span>
            {toast}
            <button aria-label="Dismiss notification" onClick={() => setToast('')}>
              <X size={16} />
            </button>
          </>
        )}
      </div>
      {dialog && (
        <Modal
          key={dialog.type}
          title={
            dialog.type === 'event'
              ? selectedEvent?.title || 'Event details'
              : dialog.type === 'ticket'
                ? 'Your event pass'
                : dialog.type === 'register'
                  ? 'Register for event'
                  : dialog.type === 'create'
                    ? 'Create an event'
                    : dialog.type === 'edit'
                      ? 'Edit event'
                      : dialog.type === 'profile'
                        ? 'Your profile'
                        : dialog.type === 'help'
                          ? 'Campusly help'
                          : 'Confirm action'
          }
          onClose={closeDialog}
          wide={dialog.type === 'event' || dialog.type === 'create' || dialog.type === 'edit'}
        >
          {dialog.type === 'event' && selectedEvent && (
            <>
              <div className="detail-image">
                <img src={selectedEvent.image} alt={selectedEvent.title} />
                <span className="category-badge">
                  <CategoryIcon category={selectedEvent.category} />
                  {selectedEvent.category}
                </span>
              </div>
              <div className="modal-body event-detail">
                <div className="detail-eyebrow">
                  <span className="eyebrow">BY {selectedEvent.organizer.toUpperCase()}</span>
                  <button
                    className={`icon-button ${saved.includes(selectedEvent.id) ? 'is-saved' : ''}`}
                    onClick={() => toggleSave(selectedEvent)}
                    aria-label={saved.includes(selectedEvent.id) ? 'Unsave event' : 'Save event'}
                    aria-pressed={saved.includes(selectedEvent.id)}
                  >
                    <Bookmark
                      size={20}
                      fill={saved.includes(selectedEvent.id) ? 'currentColor' : 'none'}
                    />
                  </button>
                </div>
                <h2>{selectedEvent.title}</h2>
                <div className="event-facts">
                  <div>
                    <CalendarDays size={20} />
                    <span>
                      <strong>
                        {dateLabel(selectedEvent.date, {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </strong>
                      <small>
                        {timeLabel(selectedEvent.time)} · {selectedEvent.duration / 60} hours
                      </small>
                    </span>
                  </div>
                  <div>
                    <MapPin size={20} />
                    <span>
                      <strong>{selectedEvent.venue}</strong>
                      <small>{profile.campus}</small>
                    </span>
                  </div>
                </div>
                <h3>A little about the good time</h3>
                <p className="event-description">{selectedEvent.description}</p>
                <div className="detail-attendance">
                  <Avatars count={selectedEvent.attendees + (alreadyRegistered ? 1 : 0)} />
                  <span>
                    {Math.max(
                      0,
                      selectedEvent.capacity -
                        selectedEvent.attendees -
                        (alreadyRegistered ? 1 : 0),
                    )}{' '}
                    places left
                  </span>
                </div>
                <div className="capacity-track">
                  <span
                    style={{
                      width: `${Math.min(100, ((selectedEvent.attendees + (alreadyRegistered ? 1 : 0)) / selectedEvent.capacity) * 100)}%`,
                    }}
                  />
                </div>
                <div className="detail-booking">
                  <div>
                    <strong>{priceLabel(selectedEvent.price)}</strong>
                    <small>
                      {selectedEvent.price
                        ? 'per person · pay at venue'
                        : 'Good times, on the house'}
                    </small>
                  </div>
                  <button
                    className="button primary"
                    disabled={
                      !alreadyRegistered &&
                      (selectedEvent.attendees >= selectedEvent.capacity ||
                        new Date(`${selectedEvent.date}T${selectedEvent.time}`) <= new Date())
                    }
                    onClick={() =>
                      setDialog(
                        alreadyRegistered
                          ? { type: 'ticket', id: alreadyRegistered.id }
                          : { type: 'register', id: selectedEvent.id },
                      )
                    }
                  >
                    {alreadyRegistered
                      ? 'View your pass'
                      : selectedEvent.attendees >= selectedEvent.capacity
                        ? 'Fully booked'
                        : new Date(`${selectedEvent.date}T${selectedEvent.time}`) <= new Date()
                          ? 'Registration closed'
                          : 'Count me in'}
                    <ArrowUpRight size={17} />
                  </button>
                </div>
                <button
                  className="text-button add-calendar"
                  onClick={() => {
                    addToCalendar(selectedEvent)
                    notify('Calendar file downloaded. Open it to add your event.')
                  }}
                >
                  <CalendarDays size={15} />
                  Add to my calendar
                </button>
              </div>
            </>
          )}
          {dialog.type === 'register' && selectedEvent && (
            <RegistrationForm
              event={selectedEvent}
              profile={profile}
              onSubmit={handleRegistration}
              onBack={() => setDialog({ type: 'event', id: selectedEvent.id })}
            />
          )}
          {dialog.type === 'ticket' && selectedRegistration && ticketEvent && (
            <div className="modal-body pass-modal">
              <span className="success-circle">
                <Check size={30} />
              </span>
              <span className="modal-kicker">OFFICIALLY ON THE LIST</span>
              <h2>See you there, {selectedRegistration.name.split(' ')[0]}.</h2>
              <p className="modal-description">Your next good story is all booked.</p>
              <div className="event-pass">
                <div className="pass-header">
                  <Brand />
                  <span>ADMIT ONE</span>
                </div>
                <span className="pass-category">{ticketEvent.category}</span>
                <h3>{ticketEvent.title}</h3>
                <div className="pass-details">
                  <div>
                    <small>WHEN</small>
                    <strong>
                      {dateLabel(ticketEvent.date)} · {timeLabel(ticketEvent.time)}
                    </strong>
                  </div>
                  <div>
                    <small>WHERE</small>
                    <strong>{ticketEvent.venue}</strong>
                  </div>
                  <div>
                    <small>GUEST</small>
                    <strong>{selectedRegistration.name}</strong>
                  </div>
                  <div>
                    <small>ENTRY</small>
                    <strong>
                      {ticketEvent.price
                        ? `${priceLabel(ticketEvent.price)} at venue`
                        : 'Free entry'}
                    </strong>
                  </div>
                </div>
                <div className="pass-tear" />
                <div className="pass-reference">
                  <Ticket size={26} />
                  <div>
                    <small>YOUR BOOKING REFERENCE</small>
                    <strong>{selectedRegistration.id}</strong>
                  </div>
                  <Check size={23} />
                </div>
              </div>
              <div className="pass-buttons">
                <button
                  className="button primary"
                  onClick={() => downloadTicket(selectedRegistration, ticketEvent)}
                >
                  <ArrowDownToLine size={16} />
                  Download pass
                </button>
                <button
                  className="button secondary"
                  onClick={() => {
                    addToCalendar(ticketEvent)
                    notify('Your calendar file is ready.')
                  }}
                >
                  <CalendarDays size={16} />
                  Add to calendar
                </button>
              </div>
              <button
                className="text-button"
                onClick={() => {
                  closeDialog()
                  navigate('tickets')
                }}
              >
                See all my tickets
                <ArrowRight size={15} />
              </button>
            </div>
          )}
          {(dialog.type === 'create' || dialog.type === 'edit') && (
            <EventForm
              event={dialog.type === 'edit' ? selectedEvent : undefined}
              registrationCount={
                registrations.filter((reg) => reg.eventId === selectedEvent?.id).length
              }
              onSubmit={saveEvent}
              onCancel={closeDialog}
            />
          )}
          {dialog.type === 'profile' && (
            <ProfileForm
              profile={profile}
              onSave={(next) => {
                setProfile(next)
                closeDialog()
                notify('Looking good. Your profile is updated.')
              }}
            />
          )}
          {dialog.type === 'delete' && selectedEvent && (
            <div className="modal-body confirm-modal">
              <span className="empty-icon">
                <CalendarDays size={26} />
              </span>
              <h2>Cancel this event?</h2>
              <p>
                <strong>{selectedEvent.title}</strong> will be removed from the campus calendar,
                along with its registrations and saved entries.
              </p>
              <div className="modal-actions">
                <button className="button secondary" onClick={closeDialog}>
                  Keep event
                </button>
                <button
                  className="button destructive"
                  onClick={() => {
                    setEvents((current) => current.filter((event) => event.id !== selectedEvent.id))
                    setSaved((current) => current.filter((id) => id !== selectedEvent.id))
                    setRegistrations((current) =>
                      current.filter((reg) => reg.eventId !== selectedEvent.id),
                    )
                    closeDialog()
                    notify('Your event has been removed.')
                  }}
                >
                  Delete event
                </button>
              </div>
            </div>
          )}
          {dialog.type === 'cancel' && selectedRegistration && ticketEvent && (
            <div className="modal-body confirm-modal">
              <span className="empty-icon">
                <Ticket size={26} />
              </span>
              <h2>Change of plans?</h2>
              <p>
                Your place at <strong>{ticketEvent.title}</strong> will be released. You can
                register again while spots are available.
              </p>
              <div className="modal-actions">
                <button className="button secondary" onClick={closeDialog}>
                  Keep my spot
                </button>
                <button
                  className="button destructive"
                  onClick={() => {
                    setRegistrations((current) =>
                      current.filter((reg) => reg.id !== selectedRegistration.id),
                    )
                    closeDialog()
                    notify('Registration cancelled. There’s always a next time.')
                  }}
                >
                  Cancel registration
                </button>
              </div>
            </div>
          )}
          {dialog.type === 'help' && (
            <div className="modal-body help-modal">
              <span className="modal-kicker">
                <CircleHelp size={17} />A LITTLE GUIDANCE
              </span>
              <h2>Good questions. Easy answers.</h2>
              <p className="modal-description">Here’s how to get the most out of your campus.</p>
              {[
                {
                  q: 'How do I register for an event?',
                  a: 'Open an event, choose “Count me in”, confirm your details, and you’re on the list. Your downloadable pass lives in My tickets. Bring your student ID to the event.',
                },
                {
                  q: 'How do paid events work?',
                  a: 'Reserve your spot for free here. The listed entry fee is paid directly to the organizer at the venue. Campusly does not collect payments.',
                },
                {
                  q: 'Can I change my plans?',
                  a: 'Of course. Open My tickets and choose “Cancel registration” to release your place. You can register again while there is space.',
                },
                {
                  q: 'How do I host something?',
                  a: 'Choose “Host an event”, add a name, description, date, venue, and capacity, then publish it. Use Organizer space to edit the details and export your attendee list.',
                },
                {
                  q: 'Where are my details saved?',
                  a: 'This is an interactive campus demo. Your profile, registrations, memberships, and events are saved in this browser on this device. They are not shared with a college or other users. Clearing browser storage resets your changes.',
                },
                {
                  q: 'Does Campusly support keyboard navigation?',
                  a: 'Yes. Use Tab to move between controls, Enter to select, and Escape to close a dialog. Press / or Ctrl+K (⌘K on Mac) to search. Animations respect your device’s reduced-motion setting.',
                },
              ].map((item) => (
                <details key={item.q}>
                  <summary>
                    {item.q}
                    <Plus size={16} />
                  </summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}
