# LessonLoop POC

LessonLoop is a Next.js proof of concept for coach-managed lesson plans with secure student access through magic links.

## Stack

- TypeScript
- Next.js App Router
- React
- Tailwind CSS
- Supabase Postgres
- Supabase Auth with Google and Apple OAuth
- Next.js API routes for student token flows

## App Flow

- `/login`: coach OAuth sign-in with Google or Apple
- `/dashboard`: protected coach student list
- `/students/new`: create a student
- `/students/[id]`: student details and plans
- `/plans/new?studentId=...`: create a plan
- `/plans/[id]`: plan details, completion reports, and magic-link generation
- `/p/[token]`: public student view backed by server-side token validation

## Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`SUPABASE_SERVICE_ROLE_KEY` is only used in server route handlers and must never be exposed to client components.

## Expected Tables

The Supabase schema is assumed to already exist with these tables and compatible columns:

- `students`: `id`, `coach_id`, `name`, `email`, `notes`, `created_at`
- `plans`: `id`, `coach_id`, `student_id`, `title`, `focus`, `main_cue`, `plan_json`, `booking_link`, `created_at`
- `magic_links`: `id`, `coach_id`, `student_id`, `plan_id`, `token_hash`, `expires_at`, `revoked_at`, `created_at`
- `completion_reports`: `id`, `plan_id`, `student_id`, `magic_link_id`, `completed`, `notes`, `created_at`

Coach-facing reads and writes use the logged-in Supabase session so RLS can enforce `coach_id = auth.uid()`. Student magic-link validation uses the service role key on the server only, hashes the provided URL token, and returns only the permitted plan payload.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Supabase Auth Setup

In Supabase Auth:

1. Enable Google and Apple providers.
2. Add `http://localhost:3000/auth/callback` to redirect URLs.
3. Add the deployed Vercel callback URL after deployment: `https://your-domain.vercel.app/auth/callback`.

## Vercel Deploy Notes

1. Import the repo into Vercel.
2. Add the environment variables above in Project Settings.
3. Set `NEXT_PUBLIC_APP_URL` to the production URL.
4. Add the production callback URL in Supabase Auth.
5. Deploy normally with the Next.js framework preset.

## Security Notes

- Students do not use SSO and never receive Supabase credentials.
- Magic-link tokens are generated with `crypto.randomBytes`.
- Only the SHA-256 token hash is stored in `magic_links`.
- Token validation happens in server API routes.
- Coach routes are protected by middleware.
- Components call repositories or internal API routes, not Supabase directly.
