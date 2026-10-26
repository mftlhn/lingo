# Lingo — Personal English Learning

A responsive English-learning app for Indonesian-speaking learners, built with Next.js 15, React 19, TypeScript, Tailwind CSS/DaisyUI, Prisma 6, SQLite, Auth.js Credentials, and Gemini.

## Requirements

- Node.js 20.9+
- npm
- A Gemini API key for AI vocabulary generation and conversation
- A Resend API key to deliver password-reset emails

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env`. Set a unique `AUTH_SECRET` and `GEMINI_API_KEY` to enable AI learning features. `GEMINI_MODEL` defaults to `gemini-2.5-flash`. For password reset email, also configure `APP_URL`, `RESEND_API_KEY`, and a verified `EMAIL_FROM` sender address.

3. Initialize the database and Prisma Client:

   ```bash
   npm run db:migrate
   npm run db:generate
   ```

   The default SQLite file is `prisma/dev.db`, relative to `prisma/schema.prisma`; the database file is ignored by git and persists across local app restarts. The initial migration baselines the original schema, and subsequent schema changes are tracked in `prisma/migrations`.

4. Start the development server:

   ```bash
   npm run dev
   ```

Register at `/register`. Email is normalized to lowercase; passwords are bcrypt-hashed. Daily vocabulary is generated once per account per calendar date in the learner's configured timezone. Each generated set is validated as exactly 10 unique words and stored transactionally. Review history, favorites, quiz sessions, conversation sessions, and learner settings are persisted per account.

If SMTP settings are missing, the forgot-password page reports that email delivery is not configured. Reset tokens are stored as SHA-256 hashes, are single-use, and are carried in the email URL fragment rather than sent to the web server in a request URL.

The Prisma SQLite schema uses UUIDs for new records and keeps database relationships portable for a future PostgreSQL migration. Existing legacy vocabulary rows are preserved while the normalized vocabulary tables are used by the current learning flows.

## Checks

```bash
npx prisma validate
npm run typecheck
npm run lint
npm run build
```
