create type user_role as enum ('student', 'ta', 'instructor');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name varchar(255) not null check (char_length(trim(full_name)) > 0),
  email varchar(255) not null check (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table courses (
  id uuid primary key default gen_random_uuid(),
  name varchar(255) not null check (char_length(trim(name)) > 0),
  enrollment_code varchar(8) not null unique check (enrollment_code ~ '^[A-Z0-9]{4,8}$'),
  instructor_id uuid not null references profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table course_enrollments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  role user_role not null check (role in ('student', 'ta')),
  created_at timestamptz not null default now(),
  unique (course_id, profile_id)
);