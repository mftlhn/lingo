# Lingo — Personal English Learning

A responsive English-learning app for Indonesian-speaking learners, built with Next.js 15, React 19, TypeScript, Tailwind CSS/DaisyUI, Prisma 6, Supabase PostgreSQL, Auth.js Credentials, and Gemini.

## Requirements

- Node.js 20.9+
- npm
- A Supabase PostgreSQL database
- A Gemini API key for AI vocabulary generation and conversation
- A Resend API key to deliver password-reset emails

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local`. Set `DATABASE_POSTGRES_PRISMA_URL` to the Supabase pooled Prisma connection string (port 6543 with `pgbouncer=true`) and `DATABASE_POSTGRES_URL_NON_POOLING` to the direct database connection string (port 5432). These are the exact variable names supplied by the Vercel Supabase integration and are read by Prisma for runtime queries and migrations, respectively. Keep SSL enabled as provided by Supabase. Also set a unique `AUTH_SECRET` and `GEMINI_API_KEY` to enable AI learning features. `GEMINI_MODEL` defaults to `gemini-2.5-flash`; if that model fails, generation automatically retries with `GEMINI_MODEL_BACKUP` (default `gemini-2.0-flash`). The same fallback order applies to vocabulary, grammar, and conversation requests. For password reset email, also configure `APP_URL` to the deployed app's public URL, `RESEND_API_KEY`, and a verified `EMAIL_FROM` sender address.

3. Apply the PostgreSQL migrations and generate Prisma Client:

   ```bash
   npm run db:migrate
   npm run db:generate
   ```

   Run `npm run db:migrate` against the Supabase database before serving production traffic. In Vercel, configure the Build Command as `npx prisma migrate deploy && npm run build` so the schema is deployed before the new app version goes live. The Prisma migration history in `prisma/migrations` targets PostgreSQL. The former SQLite migration files are retained in `prisma/migrations-sqlite` for reference and are not used by the application. Existing local SQLite data is not copied automatically.

4. Start the development server:

   ```bash
   npm run db:push:dev
   npm run dev
   ```

Register at `/register`. Email is normalized to lowercase; passwords are bcrypt-hashed. Daily vocabulary is generated once per account per calendar date in the learner's configured timezone. Each generated set is validated as exactly 10 unique words and stored transactionally. Review history, favorites, quiz sessions, conversation sessions, and learner settings are persisted per account.

New accounts complete a 15-question IELTS/TOEFL-style grammar placement quiz after registration to set their Beginner, Intermediate, or Advanced level. Grammar lessons generate five level-appropriate questions per local day with Gemini. Daily sets and submitted attempts are saved per user, and the Grammar page shows the full available history.

If SMTP settings are missing, the forgot-password page reports that email delivery is not configured. Reset tokens are stored as SHA-256 hashes, are single-use, and are carried in the email URL fragment rather than sent to the web server in a request URL.

The Prisma schema uses UUIDs and PostgreSQL, with foreign keys and indexes for user-scoped learning records. Existing legacy vocabulary models remain mapped in the schema for compatibility; the normalized vocabulary tables are used by the current learning flows.

## Checks

```bash
npx prisma validate
npm run typecheck
npm run lint
npm run build
```
