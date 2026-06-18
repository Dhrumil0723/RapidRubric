import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createUser(email, password, fullName) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  });
  if (error) throw new Error(`Failed to create ${email}: ${error.message}`);
  console.log(`Created user: ${email} (${data.user.id})`);
  return data.user.id;
}

async function seed() {
  const instructorId = await createUser('instructor@test.com', 'Password123!', 'Test Instructor');
  const ta1Id = await createUser('ta1@test.com', 'Password123!', 'Test TA');
  const student1Id = await createUser('student1@test.com', 'Password123!', 'Test Student 1');
  const student2Id = await createUser('student2@test.com', 'Password123!', 'Test Student 2');

  const { data: course, error: courseError } = await supabase
    .from('courses')
    .insert({
      name: 'CSCI1234',
      enrollment_code: 'TEST2026',
      instructor_id: instructorId
    })
    .select()
    .single();

  if (courseError) throw new Error(`Failed to create course: ${courseError.message}`);
  console.log(`Created course: ${course.id}`);

  const { error: enrollError } = await supabase.from('course_enrollments').insert([
    { course_id: course.id, profile_id: ta1Id, role: 'ta' },
    { course_id: course.id, profile_id: student1Id, role: 'student' },
    { course_id: course.id, profile_id: student2Id, role: 'student' },
  ]);

  if (enrollError) throw new Error(`Failed to enroll users: ${enrollError.message}`);
  console.log('Seed complete.');
}

seed().catch(console.error);