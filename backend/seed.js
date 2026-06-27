// Dev seed script. Creates test users (one per role), a course with
// enrollments, an instructor rubric, and an open assignment — enough to
// exercise the full submit -> AI -> TA review -> release pipeline.
//
// Usage: node seed.js   (requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)
require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createUser(email, password, fullName, role) {
  const passwordHash = await bcrypt.hash(password, 12)

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role },
  })
  if (error) throw new Error(`Failed to create ${email}: ${error.message}`)

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ password_hash: passwordHash })
    .eq('id', data.user.id)
  if (updateError) throw new Error(`Failed to update profile for ${email}: ${updateError.message}`)

  console.log(`Created user: ${email} (${data.user.id}) [${role}]`)
  return data.user.id
}

async function seed() {
  const instructorId = await createUser('instructor@test.com', 'Password123!', 'Test Instructor', 'instructor')
  const ta1Id        = await createUser('ta1@test.com',         'Password123!', 'Test TA',          'ta')
  const student1Id   = await createUser('student1@test.com',    'Password123!', 'Test Student 1',   'student')
  const student2Id   = await createUser('student2@test.com',    'Password123!', 'Test Student 2',   'student')

  const { data: course, error: courseError } = await supabase
    .from('courses')
    .insert({ name: 'CSCI1234', enrollment_code: 'TEST2026', instructor_id: instructorId })
    .select()
    .single()
  if (courseError) throw new Error(`Failed to create course: ${courseError.message}`)
  console.log(`Created course: ${course.id}`)

  const { error: enrollError } = await supabase.from('course_enrollments').insert([
    { course_id: course.id, profile_id: ta1Id,      role: 'ta' },
    { course_id: course.id, profile_id: student1Id, role: 'student' },
    { course_id: course.id, profile_id: student2Id, role: 'student' },
  ])
  if (enrollError) throw new Error(`Failed to enroll users: ${enrollError.message}`)

  const { data: rubric, error: rubricError } = await supabase
    .from('rubrics')
    .insert({
      instructor_id: instructorId,
      title: 'Essay Rubric',
      criteria: [
        { id: 'c1', name: 'Thesis & Argument', description: 'Clear, defensible thesis', max_score: 25 },
        { id: 'c2', name: 'Structure',         description: 'Logical organization',     max_score: 25 },
        { id: 'c3', name: 'Evidence',          description: 'Use of sources/citations', max_score: 25 },
        { id: 'c4', name: 'Grammar & Style',   description: 'Mechanics and clarity',    max_score: 25 },
      ],
    })
    .select()
    .single()
  if (rubricError) throw new Error(`Failed to create rubric: ${rubricError.message}`)
  console.log(`Created rubric: ${rubric.id}`)

  const dueAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
  const { data: assignment, error: assignmentError } = await supabase
    .from('assignments')
    .insert({
      course_id: course.id,
      rubric_id: rubric.id,
      ta_id: ta1Id,
      title: 'Essay 1: Argumentative Writing',
      description: 'Submit a 1000-word argumentative essay as a PDF.',
      due_at: dueAt,
      allow_resubmission: true,
    })
    .select()
    .single()
  if (assignmentError) throw new Error(`Failed to create assignment: ${assignmentError.message}`)
  console.log(`Created assignment: ${assignment.id}`)

  console.log('\nSeed complete. Test logins (password: Password123!):')
  console.log('  instructor@test.com | ta1@test.com | student1@test.com | student2@test.com')
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
