-- ============================================================================
-- RapidRubric — Seed data (sample rows for all feature tables)
-- Run after rapidrubric_schema.sql:  psql -f rapidrubric_schema.sql -f rapidrubric_seed.sql
-- Fixed UUIDs are used so the foreign-key relationships are easy to follow.
-- password_hash values are bcrypt hashes of "Password123!" (cost 12).
-- ============================================================================

-- Users (one per role) ------------------------------------------------------
insert into profiles (id, full_name, email, role, password_hash) values
  ('11111111-1111-1111-1111-111111111111', 'Dr. Oladapo Oyebode', 'instructor@test.com', 'instructor', '$2b$12$yBZY3lY6hx8PhqrjzxL0e.8RqKsLR.CBwbo46Bd8hlXGe89bKdwRC'),
  ('22222222-2222-2222-2222-222222222222', 'Test TA',             'ta1@test.com',       'ta',         '$2b$12$yBZY3lY6hx8PhqrjzxL0e.8RqKsLR.CBwbo46Bd8hlXGe89bKdwRC'),
  ('33333333-3333-3333-3333-333333333333', 'Test Student One',    'student1@test.com',  'student',    '$2b$12$yBZY3lY6hx8PhqrjzxL0e.8RqKsLR.CBwbo46Bd8hlXGe89bKdwRC'),
  ('44444444-4444-4444-4444-444444444444', 'Test Student Two',    'student2@test.com',  'student',    '$2b$12$yBZY3lY6hx8PhqrjzxL0e.8RqKsLR.CBwbo46Bd8hlXGe89bKdwRC');

-- Course + enrollments ------------------------------------------------------
insert into courses (id, name, enrollment_code, instructor_id) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'CSCI4177', 'AWS2026', '11111111-1111-1111-1111-111111111111');

insert into course_enrollments (course_id, profile_id, role) values
  ('aaaaaaaa-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'ta'),
  ('aaaaaaaa-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'student'),
  ('aaaaaaaa-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', 'student');

-- FEATURE 2: Rubric ---------------------------------------------------------
insert into rubrics (id, instructor_id, title, criteria, locked) values
  ('bbbbbbbb-0000-0000-0000-000000000001',
   '11111111-1111-1111-1111-111111111111',
   'Argumentative Essay Rubric',
   '[
      {"id":"c1","name":"Thesis & Argument","description":"Clear, defensible thesis","max_score":25},
      {"id":"c2","name":"Structure","description":"Logical organization and flow","max_score":25},
      {"id":"c3","name":"Evidence & Citations","description":"Use and integration of sources","max_score":25},
      {"id":"c4","name":"Grammar & Style","description":"Mechanics, clarity, and tone","max_score":25}
    ]'::jsonb,
   true);

-- Assignment binding the rubric + TA to the course --------------------------
insert into assignments (id, course_id, rubric_id, ta_id, title, description, due_at, allow_resubmission) values
  ('cccccccc-0000-0000-0000-000000000001',
   'aaaaaaaa-0000-0000-0000-000000000001',
   'bbbbbbbb-0000-0000-0000-000000000001',
   '22222222-2222-2222-2222-222222222222',
   'Essay 1: Argumentative Writing',
   'Submit a 1000-word argumentative essay as a PDF.',
   now() + interval '14 days',
   true);

-- FEATURE 1: Submission (student 1) -----------------------------------------
insert into submissions (id, assignment_id, student_id, ta_id, storage_path, comments, status, version_no) values
  ('dddddddd-0000-0000-0000-000000000001',
   'cccccccc-0000-0000-0000-000000000001',
   '33333333-3333-3333-3333-333333333333',
   '22222222-2222-2222-2222-222222222222',
   '33333333-3333-3333-3333-333333333333/cccccccc-0000-0000-0000-000000000001/1750000000000.pdf',
   'First draft — feedback welcome on my thesis.',
   'released',
   1);

-- AI first-pass feedback for that submission --------------------------------
insert into ai_feedback (submission_id, criteria, flagged_issues, summary) values
  ('dddddddd-0000-0000-0000-000000000001',
   '[
      {"id":"c1","score":20,"feedback":"Thesis is present but could be sharper.","version_diff":null},
      {"id":"c2","score":22,"feedback":"Well organized with clear paragraphs.","version_diff":null},
      {"id":"c3","score":15,"feedback":"Needs more citations to support claims.","version_diff":null},
      {"id":"c4","score":23,"feedback":"Minor grammar issues only.","version_diff":null}
    ]'::jsonb,
   '["Two claims in paragraph 3 are uncited."]'::jsonb,
   'Solid structure and writing. The main area to improve is evidence: several claims need supporting citations.');

-- FEATURE 3: TA review (final, released) ------------------------------------
insert into ta_reviews (submission_id, ta_id, criteria, total_score) values
  ('dddddddd-0000-0000-0000-000000000001',
   '22222222-2222-2222-2222-222222222222',
   '[
      {"id":"c1","score":21,"feedback":"Thesis is present but could be sharper. Tighten it in your intro."},
      {"id":"c2","score":23,"feedback":"Well organized with clear paragraphs."},
      {"id":"c3","score":16,"feedback":"Add citations for the claims in paragraph 3."},
      {"id":"c4","score":24,"feedback":"Clean writing — only minor grammar issues."}
    ]'::jsonb,
   84.00);

-- Audit log entry for the release -------------------------------------------
insert into audit_log (actor_id, action, target_id, metadata) values
  ('22222222-2222-2222-2222-222222222222',
   'release_feedback',
   'dddddddd-0000-0000-0000-000000000001',
   '{"total_score":84}'::jsonb);

-- Analytics rows for the instructor dashboard -------------------------------
insert into analytics_summary (instructor_id, total_submissions, pending_review, released, avg_score) values
  ('11111111-1111-1111-1111-111111111111', 1, 0, 1, 84.00);

insert into analytics_aggregates (instructor_id, criterion_id, criterion_name, mean_score, max_score, feedback_samples) values
  ('11111111-1111-1111-1111-111111111111', 'c3', 'Evidence & Citations', 16.00, 25.00,
   '["Add citations for the claims in paragraph 3."]'::jsonb),
  ('11111111-1111-1111-1111-111111111111', 'c1', 'Thesis & Argument', 21.00, 25.00,
   '["Thesis is present but could be sharper."]'::jsonb);
