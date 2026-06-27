-- ============================================================================
-- RapidRubric — Standalone relational schema (PostgreSQL)
-- ----------------------------------------------------------------------------
-- This is a portable, self-contained version of the schema that loads on any
-- vanilla PostgreSQL 13+ instance (psql -f rapidrubric_schema.sql), so it can
-- be inspected/graded without a Supabase project.
--
-- Differences from the live Supabase deployment (backend/supabase/migrations):
--   * profiles.id is a plain UUID PK here; in Supabase it references
--     auth.users(id) and is populated by a signup trigger.
--   * Row Level Security policies and the storage bucket are Supabase-specific
--     and therefore live only in the migrations, not in this portable file.
-- Authorization in the running app is enforced by the Express middleware
-- (JWT verification + role checks); RLS is defense-in-depth.
-- ============================================================================

create extension if not exists pgcrypto;  -- for gen_random_uuid()

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type user_role as enum ('student', 'ta', 'instructor');

create type submission_status as enum (
  'ai_processing', 'pending_ta_review', 'released', 'returned'
);

-- ---------------------------------------------------------------------------
-- Shared trigger function: keep updated_at fresh on every UPDATE
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ===========================================================================
-- Identity & enrollment
-- ===========================================================================
create table profiles (
  id             uuid primary key default gen_random_uuid(),
  full_name      varchar(255) not null check (char_length(trim(full_name)) > 0),
  email          varchar(255) not null unique check (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  role           user_role not null default 'student',
  password_hash  varchar(255),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz
);

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute procedure set_updated_at();

create table courses (
  id               uuid primary key default gen_random_uuid(),
  name             varchar(255) not null check (char_length(trim(name)) > 0),
  enrollment_code  varchar(8) not null unique check (enrollment_code ~ '^[A-Z0-9]{4,8}$'),
  instructor_id    uuid not null references profiles(id) on delete restrict,
  created_at       timestamptz not null default now()
);

create table course_enrollments (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references courses(id) on delete cascade,
  profile_id  uuid not null references profiles(id) on delete cascade,
  role        user_role not null check (role in ('student', 'ta')),
  created_at  timestamptz not null default now(),
  unique (course_id, profile_id)
);

-- ===========================================================================
-- FEATURE 2: Rubric Builder
-- ===========================================================================
create table rubrics (
  id             uuid primary key default gen_random_uuid(),
  instructor_id  uuid not null references profiles(id) on delete cascade,
  title          varchar(255) not null check (char_length(trim(title)) > 0),
  criteria       jsonb not null default '[]'::jsonb check (jsonb_typeof(criteria) = 'array'),
  locked         boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index idx_rubrics_instructor on rubrics (instructor_id);
create trigger rubrics_set_updated_at before update on rubrics
  for each row execute procedure set_updated_at();

-- Assignments bind a rubric (+ optional TA) to a course.
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
create trigger assignments_set_updated_at before update on assignments
  for each row execute procedure set_updated_at();

-- ===========================================================================
-- FEATURE 1: Draft Submission & File Upload
-- ===========================================================================
create table submissions (
  id                      uuid primary key default gen_random_uuid(),
  assignment_id           uuid not null references assignments(id) on delete cascade,
  student_id              uuid not null references profiles(id) on delete cascade,
  ta_id                   uuid references profiles(id) on delete set null,
  storage_path            text not null,
  comments                text,
  status                  submission_status not null default 'ai_processing',
  version_no              integer not null default 1 check (version_no >= 1),
  previous_submission_id  uuid references submissions(id) on delete set null,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);
create index idx_submissions_assignment on submissions (assignment_id);
create index idx_submissions_student on submissions (student_id);
create index idx_submissions_ta_status on submissions (ta_id, status, created_at desc);
create trigger submissions_set_updated_at before update on submissions
  for each row execute procedure set_updated_at();

-- Lock the assignment's rubric the moment its first submission arrives.
create or replace function lock_rubric_on_first_submission()
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
$$ language plpgsql;

create trigger submissions_lock_rubric after insert on submissions
  for each row execute procedure lock_rubric_on_first_submission();

-- AI first-pass output (one row per submission).
create table ai_feedback (
  id              uuid primary key default gen_random_uuid(),
  submission_id   uuid not null unique references submissions(id) on delete cascade,
  criteria        jsonb not null default '[]'::jsonb check (jsonb_typeof(criteria) = 'array'),
  flagged_issues  jsonb not null default '[]'::jsonb check (jsonb_typeof(flagged_issues) = 'array'),
  summary         text,
  status          text not null default 'pending_ta_review'
                    check (status in ('pending_ta_review', 'superseded')),
  created_at      timestamptz not null default now()
);
create index idx_ai_feedback_submission on ai_feedback (submission_id);

-- ===========================================================================
-- FEATURE 3: TA Review & Approval Queue
-- ===========================================================================
create table ta_reviews (
  id             uuid primary key default gen_random_uuid(),
  submission_id  uuid not null unique references submissions(id) on delete cascade,
  ta_id          uuid not null references profiles(id) on delete restrict,
  criteria       jsonb not null default '[]'::jsonb check (jsonb_typeof(criteria) = 'array'),
  total_score    numeric(6,2) not null default 0 check (total_score >= 0),
  created_at     timestamptz not null default now()
);
create index idx_ta_reviews_submission on ta_reviews (submission_id);
create index idx_ta_reviews_ta on ta_reviews (ta_id);

-- ===========================================================================
-- Supporting tables: audit log, notifications, analytics
-- ===========================================================================
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

create table notifications (
  id            uuid primary key default gen_random_uuid(),
  recipient_id  uuid not null references profiles(id) on delete cascade,
  type          text not null,
  payload       jsonb not null default '{}'::jsonb,
  sent_at       timestamptz,
  created_at    timestamptz not null default now()
);
create index idx_notifications_recipient on notifications (recipient_id);

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
