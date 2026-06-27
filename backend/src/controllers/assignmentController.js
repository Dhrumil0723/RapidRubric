const { supabase } = require('../config/supabase')
const Assignment = require('../models/Assignment')
const Rubric = require('../models/Rubric')

// Student-facing: open assignments (deadline in the future) for enrolled courses.
exports.listOpen = async (req, res, next) => {
  try {
    const assignments = await Assignment.findOpenForStudent(req.user.id)
    res.json(assignments)
  } catch (err) {
    next(err)
  }
}

// Instructor-facing: create an assignment bound to one of the instructor's
// rubrics and courses. Ownership of both is verified server-side.
exports.create = async (req, res, next) => {
  try {
    const { course_id, rubric_id, ta_id, title, description, due_at, allow_resubmission, max_file_bytes } = req.body ?? {}

    if (!course_id || !rubric_id || !title || !due_at) {
      return res.status(400).json({ message: 'course_id, rubric_id, title, and due_at are required' })
    }
    if (typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ message: 'title must be a non-empty string' })
    }
    if (Number.isNaN(Date.parse(due_at))) {
      return res.status(400).json({ message: 'due_at must be a valid ISO timestamp' })
    }

    // Verify the instructor owns the course.
    const { data: course, error: courseErr } = await supabase
      .from('courses')
      .select('id, instructor_id')
      .eq('id', course_id)
      .maybeSingle()
    if (courseErr) throw courseErr
    if (!course) return res.status(404).json({ message: 'Course not found' })
    if (course.instructor_id !== req.user.id) {
      return res.status(403).json({ message: 'You do not own this course' })
    }

    // Verify the instructor owns the rubric.
    const rubric = await Rubric.findById(rubric_id)
    if (!rubric) return res.status(404).json({ message: 'Rubric not found' })
    if (rubric.instructor_id !== req.user.id) {
      return res.status(403).json({ message: 'You do not own this rubric' })
    }

    const assignment = await Assignment.create({
      courseId: course_id,
      rubricId: rubric_id,
      taId: ta_id,
      title: title.trim(),
      description,
      dueAt: due_at,
      allowResubmission: allow_resubmission,
      maxFileBytes: max_file_bytes,
    })
    res.status(201).json(assignment)
  } catch (err) {
    next(err)
  }
}
