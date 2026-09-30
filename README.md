# Campusly

A responsive college event management website built with **React 19**, **TypeScript**, **Vite**, and **GSAP**. Forest-green and lime styling, locally bundled event photography, variable fonts, and light/dark themes.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (normally http://localhost:5173).

```bash
npm run build     # TypeScript check + optimized production build
npm run preview   # Preview the production build
```

## Features

- Search events by title, category, organizer, or venue; filter by category, date, and free entry; sort by date, popularity, or price.
- Grid/list views, featured festival, event details, attendance counts, and capacity information.
- Registration with required form validation, duplicate prevention, downloadable event passes, calendar `.ics` export, and cancellation.
- Saved events and a month calendar with event agendas and day selection.
- Community discovery, membership, search, and organizer-specific events.
- Organizer dashboard with creation, editing, deletion, registration totals, capacity tracking, and attendee CSV export.
- Editable student profile, campus activity notifications, and help.
- Persistent light/dark modes, accessible native dialogs, keyboard shortcuts, and responsive mobile navigation.
- GSAP entrance animations, staggered scroll reveals, a floating festival sticker, image hover effects, and reduced-motion support.

## Data and scope

This is a complete interactive **frontend demo**. Events, profile details, registrations, bookmarks, memberships, and theme preferences are persisted in `localStorage` in the current browser. There is no backend, authentication, shared database, email delivery, or payment processing. Paid event fees are marked as payable at the venue. Downloaded passes are demo booking references.

The demo starts with seven fictional October 2026 campus events. Create new events in Organizer space for other dates. Clearing site storage restores the seed data. Only events you create can be edited or deleted. Images are bundled locally in `public/images` and sourced from Unsplash; fonts are bundled through Fontsource.

For a live college deployment, connect the existing state flows to authenticated server endpoints and a database, enforce organizer/student roles and capacity on the server, and issue server-validated tickets.

## Browser checks

```bash
npx playwright install chromium
npm run test:e2e
```

Playwright checks discovery, search, filtering, bookmarks, theme persistence, registration, ticket/calendar downloads, cancellation, creation/edit/deletion, attendee export, calendar, communities, profile, keyboard interaction, reduced motion, and 360/768/1440px layouts. The test runner starts Vite automatically when needed.

## Main files

- `src/App.tsx` — app shell, shared state, discovery, dialogs, themes, and animation lifecycle.
- `src/pages.tsx` — calendar, communities, organizer dashboard, and forms.
- `src/components.tsx` — reusable cards, native dialog, calendar export, and ticket display.
- `src/data.ts` — typed event data, community data, and formatting helpers.
- `src/styles.css` — both themes and responsive layouts.
- `tests/campusly.spec.ts` — browser workflow checks.
