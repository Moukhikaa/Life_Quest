# Life Quest

Life Quest is a full-stack RPG productivity app that turns real-world tasks into quests. Users can create goals, choose quest difficulty, earn XP and gold, build streaks, unlock achievements, and track progress through a character-style dashboard.

**Live Demo:** [https://life-quest-g7slnwgyx-moukhikas-projects.vercel.app/](https://life-quest-g7slnwgyx-moukhikas-projects.vercel.app/)

## Overview

Most productivity tools treat tasks like chores. Life Quest makes daily progress feel like a game: every completed quest gives rewards, every streak builds momentum, and long-term effort turns into visible character growth.

The app includes a React frontend, an Express/tRPC backend, Drizzle ORM database models, OAuth-based authentication, and Vercel deployment support.

## Features

- Quest creation, completion, and abandonment flows
- Difficulty-based XP and gold rewards
- Character level progression with non-linear XP thresholds
- Streak tracking, weekly history, achievements, and profile stats
- Inventory and shop-style reward system
- AI chat companion interface
- Interactive map component support
- OAuth login and persistent account sessions
- Protected server procedures for user-specific data
- Dark and light theme support
- Responsive layout for desktop and mobile screens
- Keyboard-friendly controls and reduced-motion support

## Tech Stack

- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS
- **Backend:** Express, tRPC, Node.js
- **Database:** Drizzle ORM with MySQL/TiDB-compatible connection support
- **Auth:** OAuth session flow with secure cookies
- **UI:** Radix UI, Lucide React, Recharts, Sonner
- **Testing:** Vitest
- **Deployment:** Vercel

## Project Structure

```text
.
|-- api/                  # Vercel serverless entry point
|-- client/               # React frontend
|   |-- public/           # Static frontend assets
|   `-- src/              # App pages, components, hooks, and styles
|-- drizzle/              # Database schema, migrations, and metadata
|-- patches/              # Package patches used by pnpm
|-- server/               # Express/tRPC backend and server utilities
|-- shared/               # Shared constants, types, and progression logic
|-- package.json          # Scripts and dependencies
|-- pnpm-lock.yaml        # Locked dependency versions
|-- vercel.json           # Vercel deployment configuration
`-- vite.config.ts        # Vite app configuration
```

## Getting Started

### Prerequisites

- Node.js 20 or newer
- pnpm 10 or newer
- A MySQL/TiDB-compatible database connection

### Installation

```bash
pnpm install
```

### Environment Variables

Create a local `.env` file and configure the values needed for your environment:

```bash
DATABASE_URL=
JWT_SECRET=
VITE_APP_ID=
VITE_OAUTH_PORTAL_URL=
OAUTH_SERVER_URL=
OWNER_OPEN_ID=
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=
VITE_FRONTEND_FORGE_API_URL=
VITE_FRONTEND_FORGE_API_KEY=
```

`OWNER_OPEN_ID` and the Forge variables are only needed for environments that use those related features.

### Database Setup

Generate and apply database migrations:

```bash
pnpm db:push
```

### Run Locally

```bash
pnpm dev
```

The app runs locally at:

```text
http://localhost:3000
```

## Available Scripts

```bash
pnpm dev       # Start the development server
pnpm build     # Build the frontend and backend
pnpm start     # Start the production server from the built output
pnpm check     # Run TypeScript checks
pnpm test      # Run the Vitest test suite
pnpm format    # Format the project with Prettier
pnpm db:push   # Generate and run Drizzle migrations
```

## Deployment

This project is deployed on Vercel:

[https://life-quest-g7slnwgyx-moukhikas-projects.vercel.app/](https://life-quest-g7slnwgyx-moukhikas-projects.vercel.app/)

For a new deployment:

1. Import the repository into Vercel.
2. Add the required environment variables in the Vercel project settings.
3. Make sure the database is reachable from the deployed app.
4. Run the Drizzle migration workflow before using the production database.
5. Deploy the app and test the full user flow: login, create quest, complete quest, view rewards, refresh, and log out.

## Validation

Before submitting or deploying major changes, run:

```bash
pnpm check
pnpm test
pnpm build
```

## License

This project is licensed under the MIT License.
