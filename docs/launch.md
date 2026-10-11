# Launch guide

## Production services

Provision a dedicated PostgreSQL account database with a connection limit suitable for your deployment. Configure Google OAuth web credentials and a verified Resend sender. Choose your public domain before entering OAuth redirect URLs.

## Vercel

Import this repository as a Next.js project. Use `npm run build` as the build command. Configure these environment variables for the relevant deployment environment:

| Variable               | Value                                                        |
| ---------------------- | ------------------------------------------------------------ |
| `DATABASE_URL`         | Production PostgreSQL URL supplied by your database provider |
| `BETTER_AUTH_URL`      | Exact HTTPS origin for this deployment                       |
| `BETTER_AUTH_SECRET`   | Private random secret, at least 32 characters                |
| `GOOGLE_CLIENT_ID`     | Google OAuth web client ID                                   |
| `GOOGLE_CLIENT_SECRET` | Google OAuth web client secret                               |
| `RESEND_API_KEY`       | Resend sending API key                                       |
| `EMAIL_FROM`           | Sender address on your verified domain                       |
| `LOCAL_PREVIEW`        | `false`                                                      |

Keep credentials out of Git. Use separate app databases and secrets for staging and production. Production preview mode is disabled regardless of the flag.

Apply the committed migration to your production database with `npm run db:migrate` from a secure environment containing its `DATABASE_URL`, then deploy. The build generates Prisma Client but deliberately does not mutate production databases. For later releases, review migrations and apply them through a controlled release job before rollout.

Set Google’s authorized redirect URI to `https://YOUR_DOMAIN/api/auth/callback/google`. Update both Google’s configuration and `BETTER_AUTH_URL` when changing domains. Use the exact origin when testing submissions; mismatched origins are rejected.

Vercel's trusted client-IP header is used automatically for authentication rate limits. For other hosts, put the app behind a reverse proxy that overwrites `x-real-ip` with the actual client address; do not forward a visitor-supplied value. Answer submission limits are tied to authenticated account IDs and work independently of proxy headers.

## Launch verification

1. Download each dialect’s script and run it in an empty database. Confirm the toy table has 18 rows.
2. Sign in with Google. Complete day 1, part 1; verify part 2 opens.
3. Sign out and use an emailed link. Verify delivery, link expiry, and reuse rejection.
4. Sign in on a second device and confirm your earned star and dialect preference.
5. Submit an incorrect answer and try a locked-day URL. Confirm neither unlocks progress.
6. Complete part 2 and confirm day 2 opens.
7. Verify mobile navigation and keyboard-only answer entry.
8. On a disposable account, verify deletion removes its progress and sessions.

The automated local tests cover progress storage and signed-session validation. Actual Google consent, DNS verification, email delivery, and public-domain behavior require the production services above.

## Maintenance

The same workshop data is intentionally available to all players; this is a learning adventure, not an anti-cheating competition. Expected answers stay on the server and are never included in browser bundles. Puzzle checks compare normalized scalar values and don’t execute user SQL.

Recent attempt timestamps are pruned for a learner when they submit again. Inactive learners’ timestamps can be cleaned up periodically with a database maintenance task if needed. Database backups and provider retention settings should be chosen before public launch.
