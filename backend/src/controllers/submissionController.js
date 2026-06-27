const { supabase } = require('../config/supabase')
const Submission = require('../models/Submission')
const Assignment = require('../models/Assignment')
const AiFeedback = require('../models/AiFeedback')
const { extractText } = require('../services/pdfService')
const { gradeSubmission } = require('../services/aiService')
const { sendEmail, templates } = require('../services/emailService')

// Runs the AI first pass after the HTTP response has already been sent.
// Isolated so any failure here (e.g. no Claude credits) never crashes the
// request or leaves the submission stuck — it falls back to a safe state.
async function runAiFirstPass({ submissionId, fileBuffer, assignment, studentName }) {
  try {
    const text = await extractText(fileBuffer)
    const aiResult = await gradeSubmission({ submissionText: text, rubric: assignment.rubrics })

    await AiFeedback.create({
      submissionId,
      criteria: aiResult.criteria,
      flaggedIssues: aiResult.flagged_issues,
      summary: aiResult.summary,
    })
    await Submission.updateStatus(submissionId, 'pending_ta_review')

    const taEmail = assignment.ta?.email
    if (taEmail) {
      await sendEmail({ to: taEmail, ...templates.submissionReceived(studentName, assignment.title) })
    }
  } catch (err) {
    console.error(`AI first pass failed for submission ${submissionId}:`, err.message)
    // Leave the submission visible to the TA even if AI grading failed.
    await Submission.updateStatus(submissionId, 'pending_ta_review').catch(() => {})
  }
}

exports.create = async (req, res, next) => {
  try {
    const { assignmentId } = req.params
    const { comments } = req.body
    const file = req.file

    // --- Validation -------------------------------------------------------
    if (!file || file.mimetype !== 'application/pdf') {
      return res.status(400).json({ message: 'A PDF file is required' })
    }

    const assignment = await Assignment.findById(assignmentId)
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' })
    if (!assignment.rubrics) {
      return res.status(409).json({ message: 'Assignment has no rubric attached' })
    }
    if (new Date(assignment.due_at) < new Date()) {
      return res.status(400).json({ message: 'Deadline has passed' })
    }
    // Server-side size cutoff (the client cannot be trusted to enforce it).
    if (file.size > assignment.max_file_bytes) {
      return res.status(413).json({ message: 'File exceeds the maximum allowed size' })
    }

    // --- Resubmission / version chain ------------------------------------
    const prior = await Submission.findByStudentAndAssignment(req.user.id, assignmentId)
    if (prior.length > 0 && !assignment.allow_resubmission) {
      return res.status(409).json({ message: 'Resubmission is not allowed for this assignment' })
    }
    const versionNo = prior.length + 1
    const previousSubmissionId = prior[0]?.id ?? null

    // --- Persist file + row ----------------------------------------------
    const storagePath = `${req.user.id}/${assignmentId}/${Date.now()}.pdf`
    const { error: uploadErr } = await supabase.storage
      .from('submissions')
      .upload(storagePath, file.buffer, { contentType: 'application/pdf' })
    if (uploadErr) throw uploadErr

    const submission = await Submission.create({
      assignmentId,
      studentId: req.user.id,
      taId: assignment.ta_id,
      storagePath,
      comments,
      versionNo,
      previousSubmissionId,
    })

    // Respond immediately; the AI first pass continues in the background.
    res.status(201).json({ id: submission.id, status: submission.status, version_no: versionNo })

    runAiFirstPass({
      submissionId: submission.id,
      fileBuffer: file.buffer,
      assignment,
      studentName: req.profile?.full_name ?? req.user.email,
    })
  } catch (err) {
    next(err)
  }
}

exports.listMine = async (req, res, next) => {
  try {
    const submissions = await Submission.findByStudent(req.user.id)
    res.json(submissions.map((s) => ({
      id: s.id,
      status: s.status,
      version_no: s.version_no,
      created_at: s.created_at,
      assignment_title: s.assignments?.title,
      due_at: s.assignments?.due_at,
    })))
  } catch (err) {
    next(err)
  }
}

// PostgREST embeds a relationship as an array (to-many) or a single object
// (to-one, when the FK is UNIQUE). Normalize to a single record either way.
const one = (rel) => (Array.isArray(rel) ? rel[0] : rel) ?? null

exports.getFeedback = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.submissionId)
    if (!submission) return res.status(404).json({ message: 'Submission not found' })
    if (submission.student_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' })
    if (submission.status !== 'released') return res.status(403).json({ message: 'Feedback not yet released' })

    const review = one(submission.ta_reviews)
    const aiFeedback = one(submission.ai_feedback)
    const maxScore = submission.assignments?.rubrics?.criteria?.reduce((s, c) => s + (c.max_score ?? 0), 0)

    res.json({
      submission_id: submission.id,
      assignment_title: submission.assignments?.title,
      version_no: submission.version_no,
      total_score: review?.total_score ?? null,
      max_score: maxScore ?? null,
      summary: aiFeedback?.summary ?? null,
      criteria: review?.criteria ?? aiFeedback?.criteria ?? [],
      flagged_issues: aiFeedback?.flagged_issues ?? [],
    })
  } catch (err) {
    next(err)
  }
}
