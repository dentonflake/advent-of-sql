# Advent of SQL

A cozy, beginner-friendly 2025 adventure through Santa’s workshop. Twelve days, two parts per day, and 24 stars. Run SQL in your own database and submit one answer on the website.

## What’s included

- All 24 story-driven puzzles, progressing from SELECT to joins, grouping, and subqueries.
- One deterministic workshop dataset: nine tables and 302 rows.
- PostgreSQL, MySQL, and SQLite setup scripts with identical data and answers.
- Google and email magic-link authentication through Better Auth.
- Account-backed progress, sequential unlocking, and saved dialect preferences.
- Server-only answers, input limits, per-user submission throttling, and origin checks.
- Responsive artwork, local fonts, accessible forms, reduced-motion support, and account deletion.
- SQL, progression, production API, and cross-device persistence checks.

## Stack

Next.js App Router, React, TypeScript, Tailwind CSS, PostgreSQL, Prisma, Better Auth, and Resend. The deployment target is Vercel; the application can also run anywhere Node.js is supported.

The account database is separate from the workshop database. Players never give the website their database credentials, and the website never executes their queries.

## Run locally

Use Node.js 22.12+ (Node 24 LTS recommended), npm, and PostgreSQL. Docker Compose provides an optional local PostgreSQL server.

```sh
npm ci
cp .env.example .env.local
# Set BETTER_AUTH_SECRET to a random value of at least 32 characters.
# Example generator: node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))'
docker compose up -d postgres
```

Prisma CLI reads `.env`, while Next.js reads `.env.local`. Put the same `DATABASE_URL` in `.env`, or export it in your shell:

```sh
DATABASE_URL="postgresql://advent:advent@localhost:54329/advent_app" npm run db:migrate
npm run dev
```

Open **http://localhost:3000**. For an existing PostgreSQL installation, replace `DATABASE_URL` with your own **dedicated app database**. The Docker credentials are for local development only.

### Local preview without Google or email credentials

Set `LOCAL_PREVIEW="true"` in `.env.local` and run `npm run dev`. A local preview learner is created in the app database, and all puzzle interactions work. This is explicitly labeled in the navigation.

Preview mode works **only in development and only on localhost or 127.0.0.1**. Production builds ignore it. Switch it off to test real authentication. Never use the preview learner as a public account.

### Configure real sign-in

1. Set `BETTER_AUTH_URL` to your exact origin, e.g. `http://localhost:3000` or your HTTPS production URL.
2. Set a private random `BETTER_AUTH_SECRET`. Keep it stable across deployments.
3. Create Google OAuth web credentials and set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Add the redirect URI `YOUR_ORIGIN/api/auth/callback/google` and your app origin to the OAuth configuration.
4. Verify a sending domain in Resend. Set `RESEND_API_KEY` and `EMAIL_FROM` to an address on that domain.
5. Restart the server. Only configured sign-in methods appear.

Email links expire after ten minutes. Sign-in errors offer a new attempt; session cookies and account records save progress across devices. Resend’s free plan is enough for a small initial audience; its limits apply independently of the app.

## Checks

```sh
npm test
npm run typecheck
npm run test:auth # Requires a local test app database and auth config
npm run build
npm audit
```

To verify SQL downloads, use fresh disposable databases. The verification command loads the setup script once, then checks all 24 reference queries. It intentionally fails if the workshop tables already exist.

```sh
npm run sql:verify -- sqlite
WORKSHOP_DATABASE_URL="postgresql://USER:PASSWORD@HOST/NEW_TEST_DATABASE" npm run sql:verify -- postgresql
# MYSQL_PWD may be supplied via a secure environment; don't put passwords in command arguments.
WORKSHOP_MYSQL_DATABASE=NEW_TEST_DATABASE WORKSHOP_MYSQL_PORT=53306 npm run sql:verify -- mysql
```

For MySQL also set `WORKSHOP_MYSQL_HOST` and `WORKSHOP_MYSQL_USER` if needed. `docker compose --profile sql-test up -d` provides the optional MySQL test service.

### Production API checks

Start the production app against your **local test app database**, with real local `BETTER_AUTH_URL` and `BETTER_AUTH_SECRET` values:

```sh
npm run build
npm start
# In another terminal, using the same configuration:
npm run test:integration
```

This creates disposable accounts and signed sessions, verifies every unlock, all 24 correct answers, wrong answers, duplicate submissions, account isolation, two-device persistence, preferences, rate limits, and account deletion, then removes the test accounts. It does not send emails or contact Google. The separate `test:auth` check exercises the actual email sign-in factory with outbound delivery captured in memory: signup, session creation, hashed tokens, one-time use, and expiry. Live OAuth and actual email delivery require your service credentials and a separate launch smoke test.

## Editing puzzles and data

- `src/lib/challenges.json`: public story text and questions.
- `content/workshop.json`: canonical dataset, shared by all dialects.
- `content/solutions.json`: private reference queries for verification.
- `content/answers.json`: generated scalar answers, imported through a server-only module.
- `src/lib/sql.ts`: portable SQL generator.

After changing the dataset or reference queries:

```sh
npm run sql:generate
npm test
```

Run the server-based SQL checks again in **new** databases. Commit regenerated downloads and answers together. A shipped edition’s data and answers should remain stable; add a new edition rather than silently changing an active one.

## Deployment

See [the launch guide](docs/launch.md) for Vercel, database migrations, sign-in configuration, and final verification.

## Design

Cream paper, pine green, warm cranberry accents, and an original watercolor workshop illustration. Hierarchy, spacing, typography, and color decisions follow Refactoring UI principles. Fonts are bundled locally; the licensed book is not included in the repository.

This project is independent and is not affiliated with Advent of Code.
