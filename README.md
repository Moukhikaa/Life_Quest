# LIFE//QUEST

> Turn your real life into a game.

LIFE//QUEST is an RPG productivity web application where real-world tasks become quests, completions earn XP and gold, and consistent action grows a persistent character sheet.

## Features

- Manus OAuth login and account session flow
- Persistent database-backed quests, rewards, levels, streaks, attributes, transactions, inventory, and achievements
- Server-verified XP and gold rewards with protected tRPC procedures
- Create, complete, and abandon quests
- Non-linear progression: level thresholds grow quadratically with XP
- Character sheet, weekly history, achievements, item shop, and profile settings
- Dark and light themes with animated atmospheric backgrounds
- Responsive desktop and mobile navigation
- Reduced-motion support and keyboard-reachable controls

## Stack

React 19, Vite, TypeScript, Tailwind CSS, Express, tRPC, Drizzle ORM, MySQL/TiDB, Manus OAuth, Framer Motion-compatible CSS motion, and Lucide icons.

## Local development

```bash
pnpm install
pnpm dev
```

The app uses the project-provided environment variables for database and Manus OAuth. See `.env.example` for the expected names.

## Validation

```bash
pnpm check
pnpm test
pnpm build
```

## Deployment notes

1. Configure `DATABASE_URL`, `JWT_SECRET`, `VITE_APP_ID`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`, and the built-in Manus API variables in the deployment environment.
2. Run the Drizzle migration workflow before first use.
3. Verify the live domain over HTTPS because secure OAuth cookies are required.
4. Test the complete path: landing → signup/login → dashboard → create quest → complete quest → refresh → logout.

## AI assistance disclosure

This project was developed with AI-assisted programming support as a disclosed development aid. Product direction, design decisions, review, testing, and final submission responsibility remain with the project team. Review the hackathon organizer's policy and include the disclosure in the submission if required.

## Final judging checklist

- Confirm the repository is public and contains the full chronological commit history.
- Confirm the live domain loads without a login-required landing page and that OAuth login works over HTTPS.
- Record a short walkthrough that demonstrates signup/login, onboarding, quest creation, completion animation, level-up, refresh persistence, shop purchase, light/dark theme switching, and mobile navigation.
- Disclose AI-assisted development if required by the organizers; do not present generated work as unaided work.
- Test with keyboard navigation and a mobile device before submission.
