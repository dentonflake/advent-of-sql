# Advent of SQL

A cozy, beginner-friendly 2025 adventure through Santa's workshop. Twelve days, two parts per day, and 24 stars. Run SQL in your own database and submit one answer on the website.

## Stack

Next.js App Router, React, TypeScript, Tailwind CSS, PostgreSQL, Prisma, Better Auth (Google and email magic links), and Resend.

## Local development

```sh
npm install
cp .env.example .env.local
docker compose up -d postgres
# Prisma reads .env, so use the same DATABASE_URL in .env or your shell.
DATABASE_URL="postgresql://advent:advent@localhost:54329/advent_app" npm run db:migrate
npm run dev
```

Replace BETTER_AUTH_SECRET with a random secret. Full configuration and launch instructions will be documented as the application is built.

## Workshop database

Players choose PostgreSQL, MySQL, or SQLite. The workshop is independent of the website's account database. Setup scripts contain the same deterministic data in every dialect.
