-- Row Level Security (RLS) policies restrict what each authenticated user can see and modify.
-- auth.uid() returns the UUID of the currently logged-in user, and every policy is evaluated
-- per row per request -- if no policy matches, the row is invisible or the operation is blocked.

-- profiles RLS
alter table profiles enable row level security;

create policy "Users can view own profile"
on profiles for select
using (auth.uid() = id);

create policy "Users can update own profile"
on profiles for update
using (auth.uid() = id);

-- courses RLS
alter table courses enable row level security;

create policy "Instructors can manage their own courses"
on courses for all
using (instructor_id = auth.uid());

create policy "Enrolled users can view their course"
on courses for select
using (
  exists (
    select 1 from course_enrollments
    where course_enrollments.course_id = courses.id
    and course_enrollments.profile_id = auth.uid()
  )
);

-- course_enrollments RLS
alter table course_enrollments enable row level security;

create policy "Users can view their own enrollments"
on course_enrollments for select
using (profile_id = auth.uid());

create policy "Instructors can manage enrollments in their course"
on course_enrollments for all
using (
  exists (
    select 1 from courses
    where courses.id = course_enrollments.course_id
    and courses.instructor_id = auth.uid()
  )
);