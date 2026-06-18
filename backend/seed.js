import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createUser(email, password, fullName, role) {
  const passwordHash = await bcrypt.hash(password, 12);

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role },
  });
  if (error) throw new Error(`Failed to create ${email}: ${error.message}`);

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ password_hash: passwordHash })
    .eq('id', data.user.id);
  if (updateError) throw new Error(`Failed to update profile for ${email}: ${updateError.message}`);

  console.log(`Created user: ${email} (${data.user.id}) [${role}]`);
  return data.user.id;
}

async function seed() {
  const instructorId = await createUser('instructor@test.com', 'Password123!', 'Test Instructor', 'instructor');
  const ta1Id        = await createUser('ta1@test.com',         'Password123!', 'Test TA',          'ta');
  const student1Id   = await createUser('student1@test.com',    'Password123!', 'Test Student 1',   'student');
  const student2Id   = await createUser('student2@test.com',    'Password123!', 'Test Student 2',   'student');

  const { data: course, error: courseError } = await supabase
    .from('courses')
    .insert({
      name: 'CSCI1234',
      enrollment_code: 'TEST2026',
      instructor_id: instructorId,
    })
    .select()
    .single();

  if (courseError) throw new Error(`Failed to create course: ${courseError.message}`);
  console.log(`Created course: ${course.id}`);

  const { error: enrollError } = await supabase.from('course_enrollments').insert([
    { course_id: course.id, profile_id: ta1Id,      role: 'ta' },
    { course_id: course.id, profile_id: student1Id, role: 'student' },
    { course_id: course.id, profile_id: student2Id, role: 'student' },
  ]);

  if (enrollError) throw new Error(`Failed to enroll users: ${enrollError.message}`);
  console.log('Seed complete.');
}

seed().catch(console.error);
