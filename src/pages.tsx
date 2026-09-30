import { useState } from 'react'
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Edit3,
  MapPin,
  Plus,
  Search,
  Sparkles,
  Ticket,
  Trash2,
  Users,
} from 'lucide-react'
import type { CampusEvent, Profile, Registration } from './data'
import { categories, clubs, dateLabel, priceLabel, timeLabel } from './data'
import { CategoryIcon, EmptyState } from './components'
import { downloadFile } from './hooks'

export function CalendarPage({
  events,
  onOpen,
}: {
  events: CampusEvent[]
  onOpen: (event: CampusEvent) => void
}) {
  const upcoming = events
    .filter((event) => new Date(event.date + 'T23:59:59') >= new Date())
    .sort((a, b) => a.date.localeCompare(b.date))[0]
  const [month, setMonth] = useState(
    () => new Date((upcoming?.date || new Date().toISOString().slice(0, 10)) + 'T12:00:00'),
  )
  const [selected, setSelected] = useState<string | null>(null)
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const offset = (new Date(year, monthIndex, 1).getDay() + 6) % 7
  const days = new Date(year, monthIndex + 1, 0).getDate()
  const monthPrefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}`
  const monthEvents = events
    .filter((event) => event.date.startsWith(monthPrefix))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
  const agendaEvents = selected
    ? monthEvents.filter((event) => event.date === selected)
    : monthEvents
  const changeMonth = (delta: number) => {
    setMonth(new Date(year, monthIndex + delta, 1))
    setSelected(null)
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">GOOD PLANS START HERE</span>
          <h1>A little less FOMO.</h1>
          <p>Your whole campus, one beautifully busy calendar.</p>
        </div>
        <span className="heading-chip">
          <CalendarDays size={16} />
          {monthEvents.length} events this month
        </span>
      </div>
      <section className="calendar-panel reveal">
        <div className="calendar-toolbar">
          <h2>{month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
          <div>
            <button
              className="button secondary small"
              onClick={() => {
                setMonth(new Date())
                setSelected(null)
              }}
            >
              Today
            </button>
            <button
              className="icon-button"
              aria-label="Previous month"
              onClick={() => changeMonth(-1)}
            >
              <ChevronLeft size={19} />
            </button>
            <button className="icon-button" aria-label="Next month" onClick={() => changeMonth(1)}>
              <ChevronRight size={19} />
            </button>
          </div>
        </div>
        <div className="calendar-grid" role="grid" aria-label="Event calendar">
          {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
            <div className="calendar-weekday" key={day} role="columnheader">
              {day}
            </div>
          ))}
          {Array.from({ length: Math.ceil((offset + days) / 7) * 7 }, (_, index) => {
            const day = index - offset + 1
            if (day < 1 || day > days)
              return <div className="calendar-day outside" key={index} role="gridcell" />
            const date = `${monthPrefix}-${String(day).padStart(2, '0')}`
            const dayEvents = monthEvents.filter((event) => event.date === date)
            const today =
              date ===
              `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
            return (
              <div
                className={`calendar-day ${selected === date ? 'selected' : ''} ${today ? 'today' : ''}`}
                key={index}
                role="gridcell"
              >
                <button
                  className="day-number"
                  onClick={() => setSelected(selected === date ? null : date)}
                  aria-label={`Show events on ${dateLabel(date, { month: 'long', day: 'numeric' })}`}
                  aria-pressed={selected === date}
                >
                  {day}
                  <span className="mobile-dots">
                    {dayEvents.map((event) => (
                      <i key={event.id} />
                    ))}
                  </span>
                </button>
                {dayEvents.map((event) => (
                  <button
                    key={event.id}
                    className={`calendar-event category-${event.category.toLowerCase().split(' ')[0]}`}
                    onClick={() => onOpen(event)}
                  >
                    <span>{timeLabel(event.time)}</span>
                    {event.title}
                  </button>
                ))}
              </div>
            )
          })}
        </div>
      </section>
      <div className="section-heading agenda-heading">
        <h2>
          {selected
            ? dateLabel(selected, { weekday: 'long', month: 'long', day: 'numeric' })
            : 'Coming up this month'}
        </h2>
        {selected && (
          <button className="text-button" onClick={() => setSelected(null)}>
            Show full month
            <ArrowRight size={15} />
          </button>
        )}
      </div>
      {agendaEvents.length ? (
        <div className="agenda-list">
          {agendaEvents.map((event) => (
            <button className="agenda-row" key={event.id} onClick={() => onOpen(event)}>
              <span className="agenda-date">
                <strong>{dateLabel(event.date, { day: '2-digit' })}</strong>
                {dateLabel(event.date, { month: 'short' })}
              </span>
              <span className="agenda-icon">
                <CategoryIcon category={event.category} size={20} />
              </span>
              <span className="agenda-info">
                <strong>{event.title}</strong>
                <span>
                  {timeLabel(event.time)} · {event.venue}
                </span>
              </span>
              <span className="agenda-price">{priceLabel(event.price)}</span>
              <ArrowUpRight size={20} />
            </button>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<CalendarDays />}
          title="A little room to breathe."
          description="No events on the calendar here. Try another day or month."
        />
      )}
    </>
  )
}

export function ClubsPage({
  joined,
  onJoin,
  onExplore,
}: {
  joined: string[]
  onJoin: (id: string) => void
  onExplore: (organizer: string) => void
}) {
  const [query, setQuery] = useState('')
  const [onlyJoined, setOnlyJoined] = useState(false)
  const filtered = clubs.filter(
    (club) =>
      (!onlyJoined || joined.includes(club.id)) &&
      `${club.name} ${club.category} ${club.description}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  )
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">THERE’S A PLACE FOR YOU</span>
          <h1>Find your people.</h1>
          <p>Shared interests. New friendships. A campus that feels like home.</p>
        </div>
        <span className="heading-chip">
          <Users size={16} />
          {joined.length} communities joined
        </span>
      </div>
      <div className="club-banner reveal">
        <div>
          <span className="eyebrow">BETTER, TOGETHER</span>
          <h2>
            Big things start with
            <br />a simple “hey.”
          </h2>
          <p>Follow your curiosity. Your next community is right here.</p>
        </div>
        <div className="club-illustration" aria-hidden="true">
          <span>hey!</span>
          <span>hello.</span>
          <span>you in?</span>
          <Sparkles />
        </div>
      </div>
      <div className="filter-bar">
        <div className="tab-group">
          <button className={!onlyJoined ? 'active' : ''} onClick={() => setOnlyJoined(false)}>
            All communities
          </button>
          <button className={onlyJoined ? 'active' : ''} onClick={() => setOnlyJoined(true)}>
            My communities <span>{joined.length}</span>
          </button>
        </div>
        <label className="inline-search">
          <Search size={16} />
          <input
            aria-label="Search communities"
            placeholder="Find your community..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <div className="clubs-grid">
        {filtered.map((club) => (
          <article className="club-card reveal" key={club.id}>
            <div className={`club-monogram ${club.color}`}>
              {club.short}
              <span>
                <CategoryIcon category={club.category} size={17} />
              </span>
            </div>
            <span className="club-category">{club.category}</span>
            <h3>{club.name}</h3>
            <p>{club.description}</p>
            <span className="club-members">
              <Users size={14} />
              {club.members + (joined.includes(club.id) ? 1 : 0)} like-minded people
            </span>
            <div className="club-card-actions">
              <button
                className={`button ${joined.includes(club.id) ? 'secondary' : 'primary'} small`}
                onClick={() => onJoin(club.id)}
              >
                {joined.includes(club.id) ? (
                  <>
                    <Check size={15} />
                    Joined
                  </>
                ) : (
                  <>
                    <Plus size={15} />
                    Join community
                  </>
                )}
              </button>
              <button
                className="icon-button"
                aria-label={`View events by ${club.name}`}
                onClick={() => onExplore(club.name)}
              >
                <ArrowUpRight size={20} />
              </button>
            </div>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <EmptyState
          icon={<Users />}
          title={onlyJoined ? 'Your people are out there.' : 'No communities found.'}
          description={
            onlyJoined
              ? 'Explore the campus communities and join the ones that feel like you.'
              : 'Try a different name or interest.'
          }
          action="Explore all communities"
          onAction={() => {
            setOnlyJoined(false)
            setQuery('')
          }}
        />
      )}
    </>
  )
}

function exportAttendees(event: CampusEvent, registrations: Registration[]) {
  const cell = (value: string) =>
    `"${(/^[=+\-@\t\r]/.test(value) ? "'" + value : value).replace(/"/g, '""')}"`
  const rows = [
    ['Booking reference', 'Name', 'Email', 'Course', 'Registered at'],
    ...registrations
      .filter((reg) => reg.eventId === event.id)
      .map((reg) => [reg.id, reg.name, reg.email, reg.course, reg.registeredAt]),
  ]
  downloadFile(
    rows.map((row) => row.map(cell).join(',')).join('\r\n'),
    `${event.id}-attendees.csv`,
    'text/csv;charset=utf-8',
  )
}

export function DashboardPage({
  events,
  registrations,
  onCreate,
  onEdit,
  onDelete,
  onOpen,
}: {
  events: CampusEvent[]
  registrations: Registration[]
  onCreate: () => void
  onEdit: (event: CampusEvent) => void
  onDelete: (event: CampusEvent) => void
  onOpen: (event: CampusEvent) => void
}) {
  const owned = events.filter((event) => event.owned)
  const hostedRegistrations = registrations.filter((reg) =>
    owned.some((event) => event.id === reg.eventId),
  )
  const totalCapacity = owned.reduce((sum, event) => sum + event.capacity, 0)
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">MAKE SOMETHING HAPPEN</span>
          <h1>Good ideas deserve a crowd.</h1>
          <p>Your events, your community, your little corner of campus.</p>
        </div>
        <button className="button primary" onClick={onCreate}>
          <Plus size={17} />
          Create an event
        </button>
      </div>
      <div className="dashboard-stats">
        {[
          {
            label: 'Events you’re hosting',
            value: owned.length,
            icon: CalendarDays,
            caption: 'Ideas brought to life',
          },
          {
            label: 'Total registrations',
            value: hostedRegistrations.length,
            icon: Ticket,
            caption: 'People joining your story',
          },
          {
            label: 'Places available',
            value: totalCapacity - hostedRegistrations.length,
            icon: Users,
            caption: 'Room for more memories',
          },
        ].map((stat) => (
          <article className="stat-card reveal" key={stat.label}>
            <span className="stat-icon">
              <stat.icon size={21} />
            </span>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <small>{stat.caption}</small>
          </article>
        ))}
      </div>
      <div className="section-heading">
        <h2>
          Your hosted events <span className="count-badge">{owned.length}</span>
        </h2>
        <span className="subtle">A little planning. A lot of possibility.</span>
      </div>
      {owned.length ? (
        <div className="hosted-list">
          {owned.map((event) => (
            <article className="hosted-row" key={event.id}>
              <img src={event.image} alt="" />
              <div className="hosted-info">
                <button onClick={() => onOpen(event)}>{event.title}</button>
                <span>
                  {dateLabel(event.date)} · {timeLabel(event.time)} · {event.venue}
                </span>
                <small>
                  <Users size={13} />
                  {registrations.filter((reg) => reg.eventId === event.id).length} /{' '}
                  {event.capacity} registered
                </small>
              </div>
              <div className="hosted-actions">
                <button
                  className="icon-button"
                  aria-label={`Export attendees for ${event.title}`}
                  title="Export attendees"
                  onClick={() => exportAttendees(event, registrations)}
                >
                  <ArrowDownToLine size={17} />
                </button>
                <button
                  className="icon-button"
                  aria-label={`Edit ${event.title}`}
                  title="Edit event"
                  onClick={() => onEdit(event)}
                >
                  <Edit3 size={17} />
                </button>
                <button
                  className="icon-button danger"
                  aria-label={`Delete ${event.title}`}
                  title="Delete event"
                  onClick={() => onDelete(event)}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<CirclePlus size={30} />}
          title="Your next big thing starts here."
          description="A workshop, a tournament, or an idea no one has tried yet. Create your first event and bring campus together."
          action="Create your first event"
          onAction={onCreate}
        />
      )}
      <div className="organizer-note">
        <Sparkles size={25} />
        <div>
          <h3>A great event is all in the details.</h3>
          <p>
            Give it a clear name, choose a welcoming space, and let people know what to bring. You
            can update your event and download your attendee list right here.
          </p>
        </div>
      </div>
    </>
  )
}

export function EventForm({
  event,
  registrationCount,
  onSubmit,
  onCancel,
}: {
  event?: CampusEvent
  registrationCount: number
  onSubmit: (event: CampusEvent) => void
  onCancel: () => void
}) {
  const [category, setCategory] = useState(event?.category || categories[0])
  const [error, setError] = useState('')
  const photos: Record<string, string> = {
    'Music & arts': '/images/music.jpg',
    Technology: '/images/hackathon.jpg',
    Sports: '/images/basketball.jpg',
    Workshops: '/images/workshop.jpg',
    Community: '/images/community.jpg',
  }
  const today = new Date()
  const minimum = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  return (
    <form
      className="modal-body event-form"
      onSubmit={(e) => {
        e.preventDefault()
        const data = new FormData(e.currentTarget)
        const date = String(data.get('date'))
        const time = String(data.get('time'))
        if (new Date(`${date}T${time}:00`) <= new Date()) {
          setError('Choose a date and time in the future.')
          return
        }
        const title = String(data.get('title')).trim()
        const venue = String(data.get('venue')).trim()
        const organizer = String(data.get('organizer')).trim()
        const description = String(data.get('description')).trim()
        if (!title || !venue || !organizer || !description) {
          setError('Please fill in every field with a little detail.')
          return
        }
        onSubmit({
          id: event?.id || `event-${crypto.randomUUID()}`,
          title,
          category,
          date,
          time,
          duration: Number(data.get('duration')),
          venue,
          organizer,
          description,
          image: event?.image || photos[category],
          price: Number(data.get('price')),
          capacity: Number(data.get('capacity')),
          attendees: event?.attendees || 0,
          owned: true,
        })
      }}
    >
      <span className="modal-kicker">
        <Sparkles size={16} />
        THE NEXT CAMPUS HIGHLIGHT
      </span>
      <h2>{event ? 'Make it even better.' : 'Let’s make it happen.'}</h2>
      <p className="modal-description">
        {event
          ? 'Update your event details. Your attendees and saved places stay connected.'
          : 'Bring your idea to life. Fill in the details and invite your campus in.'}
      </p>
      <label>
        Event name
        <input
          name="title"
          required
          maxLength={80}
          placeholder="Give your event a good name"
          defaultValue={event?.title}
        />
      </label>
      <div className="form-row">
        <label>
          Category
          <select
            aria-label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value as typeof category)}
          >
            {categories.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>
        </label>
        <label>
          Hosted by
          <input
            name="organizer"
            required
            maxLength={70}
            placeholder="Your club or organization"
            defaultValue={event?.organizer}
          />
        </label>
      </div>
      <div className="form-row">
        <label>
          Date
          <input type="date" name="date" min={minimum} required defaultValue={event?.date} />
        </label>
        <label>
          Start time
          <input type="time" name="time" required defaultValue={event?.time || '10:00'} />
        </label>
      </div>
      <div className="form-row">
        <label>
          Venue
          <input
            name="venue"
            required
            maxLength={80}
            placeholder="Where’s it happening?"
            defaultValue={event?.venue}
          />
        </label>
        <label>
          Duration
          <select aria-label="Duration" name="duration" defaultValue={event?.duration || 120}>
            {[60, 90, 120, 150, 180, 240, 360, 480].map((value) => (
              <option value={value} key={value}>
                {value / 60} hours
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="form-row">
        <label>
          Capacity
          <input
            type="number"
            name="capacity"
            min={Math.max(1, registrationCount)}
            max={10000}
            required
            defaultValue={event?.capacity || 100}
          />
        </label>
        <label>
          Entry fee (₹)
          <input
            type="number"
            name="price"
            min={0}
            max={50000}
            required
            defaultValue={event?.price || 0}
          />
          <small>Use 0 for free. Fees are collected at the venue.</small>
        </label>
      </div>
      <label>
        Tell people about it
        <textarea
          name="description"
          rows={4}
          minLength={20}
          maxLength={1800}
          required
          placeholder="What’s happening? Who’s it for? Anything to bring?"
          defaultValue={event?.description}
        />
      </label>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <div className="modal-actions">
        <button type="button" className="button secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="button primary" type="submit">
          {event ? 'Save changes' : 'Publish event'}
          <ArrowUpRight size={16} />
        </button>
      </div>
    </form>
  )
}

export function ProfileForm({
  profile,
  onSave,
}: {
  profile: Profile
  onSave: (profile: Profile) => void
}) {
  const [error, setError] = useState('')
  return (
    <form
      className="modal-body"
      onSubmit={(e) => {
        e.preventDefault()
        const data = new FormData(e.currentTarget)
        const values = {
          name: String(data.get('name')).trim(),
          email: String(data.get('email')).trim(),
          course: String(data.get('course')).trim(),
          campus: String(data.get('campus')).trim(),
        }
        if (Object.values(values).some((value) => !value)) {
          setError('Please complete all profile details.')
          return
        }
        onSave(values)
      }}
    >
      <span className="modal-kicker">
        <Users size={16} />
        YOUR CAMPUS IDENTITY
      </span>
      <h2>Hey, good to know you.</h2>
      <p className="modal-description">A few details to make registrations a little easier.</p>
      <label>
        Full name
        <input name="name" defaultValue={profile.name} required maxLength={70} />
      </label>
      <label>
        College email
        <input type="email" name="email" defaultValue={profile.email} required maxLength={120} />
      </label>
      <label>
        Course & year
        <input name="course" defaultValue={profile.course} required maxLength={70} />
      </label>
      <label>
        Your campus
        <input name="campus" defaultValue={profile.campus} required maxLength={70} />
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button className="button primary full-width" type="submit">
        Save profile
        <Check size={16} />
      </button>
    </form>
  )
}

export function RegistrationForm({
  event,
  profile,
  onSubmit,
  onBack,
}: {
  event: CampusEvent
  profile: Profile
  onSubmit: (details: Pick<Registration, 'name' | 'email' | 'course'>) => void
  onBack: () => void
}) {
  const [error, setError] = useState('')
  return (
    <form
      className="modal-body"
      onSubmit={(e) => {
        e.preventDefault()
        const data = new FormData(e.currentTarget)
        const name = String(data.get('name')).trim()
        const email = String(data.get('email')).trim()
        const course = String(data.get('course')).trim()
        if (!name || !course) {
          setError('Please add your name and course.')
          return
        }
        onSubmit({ name, email, course })
      }}
    >
      <button type="button" className="text-button back-button" onClick={onBack}>
        <ChevronLeft size={16} />
        Back to event
      </button>
      <span className="modal-kicker">
        <Ticket size={16} />
        MAKE IT A PLAN
      </span>
      <h2>There’s a place for you.</h2>
      <p className="modal-description">
        Reserve your spot for <strong>{event.title}</strong>.
      </p>
      <div className="registration-summary">
        <span>
          <CalendarDays size={16} />
          {dateLabel(event.date, { month: 'long', day: 'numeric' })} · {timeLabel(event.time)}
        </span>
        <span>
          <MapPin size={16} />
          {event.venue}
        </span>
      </div>
      <label>
        Full name
        <input name="name" required maxLength={70} defaultValue={profile.name} />
      </label>
      <label>
        College email
        <input type="email" name="email" required maxLength={120} defaultValue={profile.email} />
      </label>
      <label>
        Course & year
        <input name="course" required maxLength={70} defaultValue={profile.course} />
      </label>
      <label className="checkbox-label">
        <input type="checkbox" required />
        I’ll follow the campus code of conduct and respect everyone at the event.
      </label>
      <div className="registration-price">
        <span>{event.price ? 'Pay at the venue' : 'A good time, on the house'}</span>
        <strong>{priceLabel(event.price)}</strong>
      </div>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <button type="submit" className="button primary full-width">
        Confirm registration
        <ArrowRight size={17} />
      </button>
      <p className="form-footnote">Your pass will be ready instantly in My tickets.</p>
    </form>
  )
}
