-- ============================================================================
-- RapidRubric — Feature tables migration
-- Adds the three core-feature entities (Rubric Builder, Draft Submission,
-- TA Review & Approval Queue) plus their supporting tables.
--
-- Builds on 20260618* migrations, which already created:
--   profiles, courses, course_enrollments  (+ user_role enum, auth trigger,
--   set_updated_at() trigger fn, RLS scaffolding, soft-delete)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
-- Lifecycle of a single submission as it moves through the grading pipeline.
create type submission_status as enum (
  'ai_processing',     -- uploaded; waiting on the AI first pass
  'pending_ta_review', -- AI done; sitting in the assigned TA's queue
  'released',          -- TA edited + released; visible to the student
  'returned'           -- TA returned for resubmission (resubmission-enabled)
);

-- ---------------------------------------------------------------------------
-- FEATURE 2: Rubric Builder (instructor-authored grading rubrics)
-- ---------------------------------------------------------------------------
create table rubrics (
  id             uuid primary key default gen_random_uuid(),
  instructor_id  uuid not null references profiles(id) on delete cascade,
  title          varchar(255) not null check (char_length(trim(title)) > 0),
  -- Ordered list of criteria; each: { id, name, description, max_score }
  criteria       jsonb not null default '[]'::jsonb
                   check (jsonb_typeof(criteria) = 'array'),
  -- Locked once grading starts so every student is graded on the same rubric.
  locked         boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index idx_rubrics_instructor on rubrics (instructor_id);

create trigger rubrics_set_updated_at
  before update on rubrics
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Assignments (course deliverables; bind a rubric + optional TA to a course)
-- ---------------------------------------------------------------------------
create table assignments (
  id                  uuid primary key default gen_random_uuid(),
  course_id           uuid not null references courses(id) on delete cascade,
  rubric_id           uuid not null references rubrics(id) on delete restrict,
  ta_id               uuid references profiles(id) on delete set null,
  title               varchar(255) not null check (char_length(trim(title)) > 0),
  description         text,
  due_at              timestamptz not null,
  allow_resubmission  boolean not null default false,
  max_file_bytes      integer not null default 10485760 check (max_file_bytes > 0),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_assignments_course on assignments (course_id);
create index idx_assignments_ta on assignments (ta_id);
create index idx_assignments_due on assignments (due_at);

create trigger assignments_set_updated_at
  before update on assignments
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------------------------
-- FEATURE 1: Draft Submission & File Upload
-- ---------------------------------------------------------------------------
create table submissions (
  id                      uuid primary key default gen_random_uuid(),
  assignment_id           uuid not null references assignments(id) on delete cascade,
  student_id              uuid not null references profiles(id) on delete cascade,
  -- TA who owns this item in the review queue (copied from assignment.ta_id).
  ta_id                   uuid references profiles(id) on delete set null,
  storage_path            text not null,
  comments                text,
  status                  submission_status not null default 'ai_processing',
  version_no              integer not null default 1 check (version_no >= 1),
  -- Self-reference forms the version chain for resubmission-enabled work.
  previous_submission_id  uuid references submissions(id) on delete set null,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index idx_submissions_assignment on submissions (assignment_id);
create index idx_submissions_student on submissions (student_id);
-- Composite index powers the TA review queue (filter by ta_id, newest first).
create index idx_submissions_ta_status on submissions (ta_id, status, created_at desc);

create trigger submissions_set_updated_at
  before update on submissions
  for each row execute procedure public.set_updated_at();

-- When the first submission for an assignment lands, lock that assignment's
-- rubric so it can no longer be edited mid-grading.
create or replace function public.lock_rubric_on_first_submission()
returns trigger as $$
begin
  update rubrics r
     set locked = true
    from assignments a
   where a.id = new.assignment_id
     and r.id = a.rubric_id
     and r.locked = false;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger submissions_lock_rubric
  after insert on submissions
  for each row execute procedure public.lock_rubric_on_first_submission();

-- ---------------------------------------------------------------------------
-- AI first-pass output (one row per submission)
-- ---------------------------------------------------------------------------
create table ai_feedback (
  id              uuid primary key default gen_random_uuid(),
  submission_id   uuid not null unique references submissions(id) on delete cascade,
  -- Per-criterion AI scores: { id, score, feedback, version_diff }
  criteria        jsonb not null default '[]'::jsonb
                    check (jsonb_typeof(criteria) = 'array'),
  flagged_issues  jsonb not null default '[]'::jsonb
                    check (jsonb_typeof(flagged_issues) = 'array'),
  summary         text,
  -- AI output is never student-visible; it waits for explicit TA release.
  status          text not null default 'pending_ta_review'
                    check (status in ('pending_ta_review', 'superseded')),
  created_at      timestamptz not null default now()
);

create index idx_ai_feedback_submission on ai_feedback (submission_id);

-- ---------------------------------------------------------------------------
-- FEATURE 3: TA Review & Approval Queue (the TA's final, released grade)
-- ---------------------------------------------------------------------------
create table ta_reviews (
  id             uuid primary key default gen_random_uuid(),
  submission_id  uuid not null unique references submissions(id) on delete cascade,
  ta_id          uuid not null references profiles(id) on delete restrict,
  -- Final per-criterion scores after TA edits: { id, score, feedback }
  criteria       jsonb not null default '[]'::jsonb
                   check (jsonb_typeof(criteria) = 'array'),
  total_score    numeric(6,2) not null default 0 check (total_score >= 0),
  created_at     timestamptz not null default now()
);

create index idx_ta_reviews_submission on ta_reviews (submission_id);
create index idx_ta_reviews_ta on ta_reviews (ta_id);

-- ---------------------------------------------------------------------------
-- Audit log (accountability for grade / feedback changes)
-- ---------------------------------------------------------------------------
create table audit_log (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references profiles(id) on delete set null,
  action      text not null,
  target_id   uuid,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index idx_audit_log_actor on audit_log (actor_id);
create index idx_audit_log_action on audit_log (action);

-- ---------------------------------------------------------------------------
-- Notifications (buffered email events) — supporting table
-- ---------------------------------------------------------------------------
create table notifications (
  id            uuid primary key default gen_random_uuid(),
  recipient_id  uuid not null references profiles(id) on delete cascade,
  type          text not null,
  payload       jsonb not null default '{}'::jsonb,
  sent_at       timestamptz,
  created_at    timestamptz not null default now()
);

create index idx_notifications_recipient on notifications (recipient_id);

-- ---------------------------------------------------------------------------
-- Analytics (instructor dashboard) — supporting tables
-- ---------------------------------------------------------------------------
create table analytics_summary (
  instructor_id      uuid primary key references profiles(id) on delete cascade,
  total_submissions  integer not null default 0,
  pending_review     integer not null default 0,
  released           integer not null default 0,
  avg_score          numeric(6,2) not null default 0,
  updated_at         timestamptz not null default now()
);

create table analytics_aggregates (
  id                uuid primary key default gen_random_uuid(),
  instructor_id     uuid not null references profiles(id) on delete cascade,
  criterion_id      text not null,
  criterion_name    text not null,
  mean_score        numeric(6,2),
  max_score         numeric(6,2),
  feedback_samples  jsonb not null default '[]'::jsonb,
  updated_at        timestamptz not null default now(),
  unique (instructor_id, criterion_id)
);

create index idx_analytics_aggregates_instructor on analytics_aggregates (instructor_id);

-- ---------------------------------------------------------------------------
-- File storage bucket for uploaded PDFs (private; backend service-role only)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('submissions', 'submissions', false, 10485760, array['application/pdf'])
on conflict (id) do nothing;

-- ============================================================================
-- Row Level Security
-- The backend talks to Postgres with the service-role key (which bypasses RLS),
-- so authorization is enforced in Express middleware. These policies are
-- defense-in-depth for any direct (anon/authenticated) access via PostgREST.
-- ============================================================================

-- Rubrics: instructors manage their own; enrolled users may read.
alter table rubrics enable row level security;

create policy "Instructors manage own rubrics"
  on rubrics for all
  using (instructor_id = auth.uid());

-- Assignments: instructors manage assignments in their courses; enrolled read.
alter table assignments enable row level security;

create policy "Instructors manage assignments in their courses"
  on assignments for all
  using (exists (
    select 1 from courses c
    where c.id = assignments.course_id and c.instructor_id = auth.uid()
  ));

create policy "Enrolled users read assignments"
  on assignments for select
  using (exists (
    select 1 from course_enrollments e
    where e.course_id = assignments.course_id and e.profile_id = auth.uid()
  ));

-- Submissions: students see their own; the assigned TA sees their queue.
alter table submissions enable row level security;

create policy "Students view own submissions"
  on submissions for select
  using (student_id = auth.uid());

create policy "Students create own submissions"
  on submissions for insert
  with check (student_id = auth.uid());

create policy "Assigned TA views queued submissions"
  on submissions for select
  using (ta_id = auth.uid());

-- AI feedback: visible to the assigned TA only (never directly to students).
alter table ai_feedback enable row level security;

create policy "Assigned TA views AI feedback"
  on ai_feedback for select
  using (exists (
    select 1 from submissions s
    where s.id = ai_feedback.submission_id and s.ta_id = auth.uid()
  ));

-- TA reviews: the authoring TA, and the student once released.
alter table ta_reviews enable row level security;

create policy "TA manages own reviews"
  on ta_reviews for all
  using (ta_id = auth.uid());

create policy "Student reads released review"
  on ta_reviews for select
  using (exists (
    select 1 from submissions s
    where s.id = ta_reviews.submission_id
      and s.student_id = auth.uid()
      and s.status = 'released'
  ));

-- Audit log, notifications, analytics: no direct client access (backend only).
alter table audit_log enable row level security;
alter table notifications enable row level security;
alter table analytics_summary enable row level security;
alter table analytics_aggregates enable row level security;

create policy "Users read own notifications"
  on notifications for select
  using (recipient_id = auth.uid());

create policy "Instructors read own analytics summary"
  on analytics_summary for select
  using (instructor_id = auth.uid());

create policy "Instructors read own analytics aggregates"
  on analytics_aggregates for select
  using (instructor_id = auth.uid());

-- ============================================================================
-- Data API grants
-- RLS (above) decides which ROWS each role may touch, but PostgREST roles still
-- need table-level privileges to reach the tables at all. Newer Supabase no
-- longer auto-grants migration-created tables, so we grant explicitly here.
-- The backend uses service_role (bypasses RLS); authenticated access is gated
-- by the policies above. This block also (idempotently) covers the tables from
-- the earlier migrations so the whole public schema is consistent.
-- ============================================================================
grant usage on schema public to anon, authenticated, service_role;
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

