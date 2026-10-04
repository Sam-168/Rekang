# Rekang

A mobile-first community marketplace connecting students, faculty, local vendors, and residents around a campus.

Rekang lets people list, discover, and trade goods and services in one trusted place, with a community bulletin board for announcements and events layered on top.

## Tech Stack

- **Frontend:** React + TypeScript (Vite)
- **Backend:** Supabase — Auth, Postgres database, Storage, Realtime, Edge Functions (no custom server)
- **Hosting:** Vercel or Netlify (frontend), Supabase (backend)
- **Payments:** PayFast / SnapScan (sandbox mode)

## Core Features

- Multi-role accounts (student, vendor, resident/faculty, admin) with university-email verification
- Product/service listings with search and filters
- Cart and checkout
- Reviews and ratings
- Community bulletin board
- Notifications
- Reporting/flagging for trust & safety

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- A [Supabase](https://supabase.com/) account with access to the shared team project
- [Git](https://git-scm.com/)

### Installation

```bash
# Clone the repo
git clone https://github.com/<your-org-or-username>/rekang.git
cd rekang

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the project root (never commit this file):

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Ask the Supabase/Database team member for these values once you've been invited to the shared Supabase project.

### Running Locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173` by default.

## Current implementation

The complete Controlled MVP screen set is implemented on the `develop` branch: authentication, marketplace/listings, cart/checkout, orders, seller profiles/reviews, community bulletins, notifications, reporting, and admin moderation. Local adapters keep every flow reviewable before credentials are available.

The Supabase schema, migrations, storage buckets, Realtime tables, database constraints, and RLS policies are ready to apply. See [`docs/supabase-setup.md`](docs/supabase-setup.md) for the setup and security model, and [`docs/implementation-progress.md`](docs/implementation-progress.md) for route and verification coverage.

## Project Structure

```
rekang/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/           # Screen-level components (Home, Listing Detail, Cart, etc.)
│   ├── lib/              # Supabase client and helper functions
│   ├── types/            # Shared TypeScript types/interfaces (e.g. Listing, Profile, Order)
│   ├── App.tsx
│   └── main.tsx
├── public/
├── supabase/            # CLI config and versioned database/storage migrations
├── .env.example
├── .gitignore
├── tsconfig.json
└── package.json
```

## Team & Roles

| Role | Responsibility |
|---|---|
| Project Manager | Timeline, stakeholder comms, deliverable docs, risk register |
| Supabase/Database Engineer | Schema, RLS policies, auth config, storage, edge functions |
| Frontend Developer — Core Marketplace | Listings, search, cart/checkout |
| Frontend Developer — Community & UX | Bulletin board, notifications, reviews, UI/UX |
| QA & Security Specialist | Testing, bug tracking, security checks, moderation |

## Branching & Contributing

- `main` is protected — no direct pushes.
- Create a feature branch per issue: `git checkout -b feature/short-description`
- Open a pull request into `main` and request at least one review before merging.
- Reference the GitHub issue number in your PR description (e.g. `Closes #12`).

## Deployment

- Frontend deploys to Vercel/Netlify from `main`.
- Backend is the shared Supabase project — no separate deployment step needed for backend logic beyond edge functions.

