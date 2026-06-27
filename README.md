# RapidRubric

**AI-assisted rubric grading and feedback platform for university writing courses.**
CSCI 4177 / CSCI 5709 — Advanced Web Services · Group 1 · Dalhousie University.

RapidRubric speeds up grading by letting an AI make a first pass over each
submission against the instructor's rubric, then routing that draft to a Teaching
Assistant (TA) who reviews, edits, and deliberately releases the final grade and
feedback. No AI output reaches a student before a TA signs off.

```
Student submits PDF → AI pre-grades → TA reviews & edits → TA releases → Student sees feedback
```

## Architecture

| Tier | Tech | Hosting |
|------|------|---------|
| Frontend | React + Vite + Tailwind + React Router | Netlify |
| Backend | Node.js + Express (REST) | Railway / Render |
| Database & Storage | PostgreSQL + Storage (Supabase) | Supabase |
| Auth | Supabase Auth (JWT) + bcrypt | — |
| External | Anthropic Claude (grading), Resend (email) | — |

The backend is the only tier that holds secrets and the only one that talks to
the database or external services.

## Repository layout

```
backend/                 Express API
  src/
    routes/              Express routers (auth, users, assignments, submissions, rubrics, ta, analytics)
    controllers/         Request handlers + validation
    models/              Supabase data-access layer
    middleware/          authenticate (JWT) + requireRole (RBAC), errorHandler
    services/            aiService (Claude/mock), pdfService (pdf-parse), emailService (Resend)
    config/              Supabase clients (service-role + stateless auth)
  supabase/migrations/   Database schema (source of truth for the deployment)
  postman/               Importable Postman collection
  seed.js                Dev seed (users, course, rubric, assignment)
frontend/                React + Vite client
database/                Portable schema + seed SQL (for inspection/grading)
docs/                    ERD image + captured API evidence
DEPLOYMENT.md            Deploy + Postman-screenshot runbook
```

## Core feature API (summary)

Base path: `/api`. Protected routes require `Authorization: Bearer <JWT>`.

### Feature 1 — Draft Submission & File Upload (student)
| Method | Route | Purpose |
|---|---|---|
| GET | `/api/assignments` | List open assignments for the student |
| POST | `/api/submissions/:assignmentId` | Upload a PDF (multipart) |
| GET | `/api/submissions` | List the student's submissions |
| GET | `/api/submissions/feedback/:submissionId` | Read released feedback |

### Feature 2 — Rubric Builder (instructor)
| Method | Route | Purpose |
|---|---|---|
| GET | `/api/rubrics` | List the instructor's rubrics |
| GET | `/api/rubrics/:id` | Get one rubric |
| POST | `/api/rubrics` | Create a rubric |
| PATCH | `/api/rubrics/:id` | Update a rubric (blocked once locked) |

### Feature 3 — TA Review & Approval Queue (TA)
| Method | Route | Purpose |
|---|---|---|
| GET | `/api/ta/queue` | The TA's review queue |
| GET | `/api/ta/:submissionId` | Submission + rubric + AI feedback |
| POST | `/api/ta/:submissionId/release` | Edit scores and release to the student |

### Security / auth
| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register (validated; bcrypt + Supabase Auth) |
| POST | `/api/auth/login` | Login → JWT |
| POST | `/api/auth/logout` | Invalidate session |
| GET | `/api/users/me` | Current user's safe profile |

Full request/response specs, the ERD, and the security discussion are in
`Assignment2_RapidRubric_DhrumilGajjar_B01071041.docx`.

## Quick start (local)

```bash
cd backend
npm install
supabase start && supabase db reset      # local Supabase via Docker
# export SUPABASE_URL / keys from `supabase status -o env` into backend/.env
node seed.js
npm run dev                               # http://localhost:3001
```

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for cloud deployment and the Postman demo.

## Test logins (after seeding)

`instructor@test.com` · `ta1@test.com` · `student1@test.com` · `student2@test.com` — password `Password123!`
