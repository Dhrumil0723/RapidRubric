# RapidRubric — Deployment & Demonstration Runbook

This guide gets the backend deployed and walks through capturing the Postman
screenshots required for Assignment 2 (Section 5 of the report). The two
implemented endpoints demonstrated are **`POST /api/rubrics`** and
**`GET /api/rubrics`** (Rubric Builder), plus the supporting `POST /api/auth/login`.

---

## 1. Prerequisites

- A Supabase project (free tier is fine).
- A Railway account (or Render — see §6).
- Node.js 20+ and the Supabase CLI (`npm i -g supabase`) for local work.
- Postman (desktop or web).

---

## 2. Apply the database schema to Supabase

The schema lives in two equivalent places:

- **Supabase migrations** (used by the app): `backend/supabase/migrations/`
- **Portable SQL** (for grading / inspection): `database/rapidrubric_schema.sql` and
  `database/rapidrubric_seed.sql`

**Option A — Supabase CLI (recommended):**
```bash
cd backend
supabase link --project-ref <your-project-ref>
supabase db push          # applies all migrations, including the feature tables
```

**Option B — SQL editor:** open the Supabase dashboard → SQL Editor, paste the
contents of each file in `backend/supabase/migrations/` in filename order, and run.

> The `20260627000000_feature_tables.sql` migration creates the rubric,
> assignment, submission, AI-feedback, TA-review, audit-log, notification and
> analytics tables, the `submissions` storage bucket, RLS policies, and the
> Data-API grants. Without it the feature endpoints return “permission denied”.

---

## 3. Configure backend environment variables

Copy `backend/.env.example` to `backend/.env` and fill in:

| Variable | Where to find it |
|---|---|
| `SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role key |
| `SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon/publishable key |
| `ANTHROPIC_API_KEY` | Anthropic console (or leave a placeholder to run the AI in mock mode) |
| `RESEND_API_KEY` | Resend dashboard (optional; email is best-effort) |
| `FRONTEND_URL` | your Netlify URL (for CORS) |

> If `ANTHROPIC_API_KEY` is unset/placeholder (or `MOCK_AI=true`), the AI first
> pass returns deterministic mock feedback so the full pipeline still works
> without spending Claude credits.

---

## 4. Seed test data (optional but recommended for the demo)

```bash
cd backend
npm install
node seed.js
```
This creates four users (password `Password123!`), a course, enrollments, a
rubric, and an open assignment:

- `instructor@test.com` · `ta1@test.com` · `student1@test.com` · `student2@test.com`

---

## 5. Deploy the backend to Railway

1. Push the repo to GitHub.
2. Railway → **New Project → Deploy from GitHub repo** → select this repo, root
   directory `backend/`.
3. Add the environment variables from §3 in the Railway **Variables** tab.
4. Railway auto-detects Node and uses `backend/railway.toml`
   (`startCommand = node src/index.js`, health check `/health`).
5. After deploy, note the public URL, e.g. `https://rapidrubric-production.up.railway.app`.
6. Smoke test: open `https://<your-app>.up.railway.app/health` → `{"status":"ok"}`.

**Paste this URL into the report (Section 5.1) where it says
`https://<your-railway-app>.up.railway.app`.**

---

## 6. (Alternative) Deploy to Render

A `render.yaml` blueprint is included. On Render → **New → Blueprint**, point at
the repo, set the same environment variables, and deploy. Start command is
`node src/index.js`, health check path `/health`, root `backend/`.

---

## 7. Run the endpoints in Postman and capture screenshots

1. Import `backend/postman/RapidRubric.postman_collection.json`.
2. Set the collection variable **`baseUrl`** to your deployed URL
   (e.g. `https://<your-app>.up.railway.app`).
3. Run the requests in this order and screenshot each (annotate the method,
   URL, status code, and response body):

| # | Postman request | Expect | Report figure |
|---|---|---|---|
| 1 | Auth → **Login (instructor)** | `200` + `access_token` (auto-saved) | Evidence 1 |
| 2 | Auth → **Login (TA)** and **Login (student)** | `200` (saves tokens) | — |
| 3 | Rubric Builder → **Create rubric (201)** | `201` + persisted rubric | **Figure 2** |
| 4 | Rubric Builder → **List rubrics (200)** | `200` + array incl. new rubric | **Figure 3** |
| 5 | Rubric Builder → **Create rubric – NO token** | `401` | **Figure 4** |
| 6 | Rubric Builder → **Create rubric – WRONG ROLE student** | `403` | **Figure 4** |
| 7 | Rubric Builder → **Create rubric – INVALID BODY** | `400` | **Figure 5** |

To show **data persistence**, screenshot the List (step 4) before and after the
Create (step 3): the new rubric appears in the list, confirming it was written to
PostgreSQL. You can also show the row in the Supabase Table Editor (`rubrics`).

4. Paste the screenshots into the report (Section 5.5) over the placeholder boxes.

---

## 8. Database source files for submission

Include these with your submission (already in the repo):

- `database/rapidrubric_schema.sql` — full DDL (loads on any PostgreSQL 13+).
- `database/rapidrubric_seed.sql` — sample data across every feature table.

Both have been verified to load into a clean PostgreSQL 17 with zero errors.

---

## 9. Local development (no deploy)

```bash
cd backend
supabase start          # local Supabase (Auth + PostgREST + Storage) via Docker
supabase db reset       # apply migrations to the local DB
# set SUPABASE_URL / keys from `supabase status -o env`, then:
node seed.js
npm run dev             # http://localhost:3001
```
