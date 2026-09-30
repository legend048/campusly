import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import {
  ArrowDownToLine,
  ArrowUpRight,
  Bookmark,
  CalendarDays,
  Check,
  Clock3,
  Code2,
  GraduationCap,
  MapPin,
  Music2,
  Palette,
  Trophy,
  Users,
  X,
} from 'lucide-react'
import gsap from 'gsap'
import type { CampusEvent, Category, Registration } from './data'
import { dateLabel, priceLabel, timeLabel } from './data'
import { downloadFile } from './hooks'

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand">
      <span className="brand-mark">
        <GraduationCap size={25} strokeWidth={1.8} />
      </span>
      {!compact && (
        <span>
          campusly<span className="brand-dot">.</span>
        </span>
      )}
    </span>
  )
}

export function CategoryIcon({
  category,
  size = 15,
}: {
  category: Category | string
  size?: number
}) {
  const Icon =
    category === 'Technology'
      ? Code2
      : category === 'Sports'
        ? Trophy
        : category === 'Workshops'
          ? Palette
          : category === 'Community'
            ? Users
            : Music2
  return <Icon size={size} />
}

export function Avatars({ count }: { count: number }) {
  return (
    <span className="attendees">
      <span className="avatar-stack" aria-hidden="true">
        <i>AK</i>
        <i>JM</i>
        <i>SR</i>
      </span>
      <span>
        <strong>{count}</strong> going
      </span>
    </span>
  )
}

export function EventCard({
  event,
  saved,
  registered,
  onSave,
  onOpen,
  list = false,
}: {
  event: CampusEvent
  saved: boolean
  registered: boolean
  onSave: () => void
  onOpen: () => void
  list?: boolean
}) {
  return (
    <article className={`event-card reveal ${list ? 'event-card-list' : ''}`}>
      <div className="event-image-wrap">
        <button className="image-open" onClick={onOpen} aria-label={`View ${event.title}`}>
          <img className="event-image" src={event.image} alt={event.title} loading="lazy" />
        </button>
        <span className={`category-badge category-${event.category.toLowerCase().split(' ')[0]}`}>
          <CategoryIcon category={event.category} />
          {event.category}
        </span>
        <button
          className={`save-button ${saved ? 'is-saved' : ''}`}
          aria-label={`${saved ? 'Unsave' : 'Save'} ${event.title}`}
          aria-pressed={saved}
          onClick={onSave}
        >
          <Bookmark size={17} fill={saved ? 'currentColor' : 'none'} />
        </button>
        {registered && (
          <span className="registered-badge">
            <Check size={12} /> You’re going
          </span>
        )}
      </div>
      <div className="event-content">
        <div className="event-date">
          <CalendarDays size={13} />
          {dateLabel(event.date, { month: 'short', day: 'numeric', weekday: 'short' })}
          <span>·</span>
          {timeLabel(event.time)}
        </div>
        <h3>
          <button onClick={onOpen}>{event.title}</button>
        </h3>
        <p className="event-location">
          <MapPin size={14} />
          {event.venue}
        </p>
        <div className="event-card-footer">
          <Avatars count={event.attendees + (registered ? 1 : 0)} />
          <button className="event-price" onClick={onOpen}>
            <span>{priceLabel(event.price)}</span>
            <ArrowUpRight size={17} />
          </button>
        </div>
      </div>
    </article>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  onAction,
}: {
  icon: ReactNode
  title: string
  description: string
  action?: string
  onAction?: () => void
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && (
        <button className="button primary" onClick={onAction}>
          {action}
          <ArrowUpRight size={16} />
        </button>
      )}
    </div>
  )
}

export function Modal({
  children,
  title,
  onClose,
  wide = false,
}: {
  children: ReactNode
  title: string
  onClose: () => void
  wide?: boolean
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current!
    const previousOverflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      gsap.fromTo(
        dialog,
        { opacity: 0, y: 22, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'power3.out' },
      )
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
    }
  }, [])
  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? 'modal-wide' : ''}`}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const rect = e.currentTarget.getBoundingClientRect()
          if (
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom
          )
            onClose()
        }
      }}
      aria-label={title}
    >
      <button className="modal-close icon-button" aria-label="Close dialog" onClick={onClose}>
        <X size={20} />
      </button>
      {children}
    </dialog>
  )
}

export function addToCalendar(event: CampusEvent) {
  const start = new Date(`${event.date}T${event.time}:00`)
  const end = new Date(start.getTime() + event.duration * 60000)
  const stamp = (date: Date) =>
    date
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '')
  const escape = (value: string) =>
    value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')
  const content = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Campusly//Campus Events//EN',
    'BEGIN:VEVENT',
    `UID:${event.id}@campusly.local`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${escape(event.title)}`,
    `LOCATION:${escape(event.venue)}`,
    `DESCRIPTION:${escape(event.description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  downloadFile(content, `${event.id}.ics`, 'text/calendar;charset=utf-8')
}

export function TicketCard({
  event,
  registration,
  onOpen,
  onCancel,
}: {
  event: CampusEvent
  registration: Registration
  onOpen: () => void
  onCancel: () => void
}) {
  return (
    <article className="ticket-card reveal">
      <div className="ticket-date">
        <span>{dateLabel(event.date, { month: 'short' })}</span>
        <strong>{dateLabel(event.date, { day: '2-digit' })}</strong>
      </div>
      <div className="ticket-content">
        <span className="eyebrow">YOU’RE ON THE LIST</span>
        <h3>{event.title}</h3>
        <p>
          <Clock3 size={14} />
          {timeLabel(event.time)}
          <span>·</span>
          <MapPin size={14} />
          {event.venue}
        </p>
        <small>
          Booked for {registration.name} · {registration.id}
        </small>
      </div>
      <div className="ticket-actions">
        <button className="button primary" onClick={onOpen}>
          View pass
          <ArrowUpRight size={15} />
        </button>
        <button className="text-button" onClick={() => addToCalendar(event)}>
          <ArrowDownToLine size={14} />
          Add to calendar
        </button>
        <button className="text-button muted" onClick={onCancel}>
          Cancel registration
        </button>
      </div>
    </article>
  )
}
