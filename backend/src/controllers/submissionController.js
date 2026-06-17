const { supabase } = require('../config/supabase')
const Submission = require('../models/Submission')
const Assignment = require('../models/Assignment')
const AiFeedback = require('../models/AiFeedback')
const { extractText } = require('../services/pdfService')
const { gradeSubmission } = require('../services/aiService')
const { sendEmail, templates } = require('../services/emailService')

exports.create = async (req, res, next) => {
  try {
    const { assignmentId } = req.params
    const { comments } = req.body
    const file = req.file

    if (!file || file.mimetype !== 'application/pdf') {
      return res.status(400).json({ message: 'A PDF file is required' })
    }

    const assignment = await Assignment.findById(assignmentId)
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' })
    if (new Date(assignment.due_at) < new Date()) {
      return res.status(400).json({ message: 'Deadline has passed' })
    }

    const storagePath = `submissions/${req.user.id}/${assignmentId}/${Date.now()}.pdf`
    const { error: uploadErr } = await supabase.storage
      .from('submissions')
      .upload(storagePath, file.buffer, { contentType: 'application/pdf' })
    if (uploadErr) throw uploadErr

    const submission = await Submission.create({
      assignmentId,
      studentId: req.user.id,
      storagePath,
      comments,
    })

    // Respond immediately — AI processing runs after
    res.status(201).json({ id: submission.id })

    const text = await extractText(file.buffer)
    const aiResult = await gradeSubmission({ submissionText: text, rubric: assignment.rubrics })

    await AiFeedback.create({
      submissionId: submission.id,
      criteria: aiResult.criteria,
      flaggedIssues: aiResult.flagged_issues,
      summary: aiResult.summary,
    })
    await Submission.updateStatus(submission.id, 'pending_ta_review')

    if (assignment.ta_email) {
      await sendEmail({ to: assignment.ta_email, ...templates.submissionReceived(req.user.email, assignment.title) })
    }
  } catch (err) {
    next(err)
  }
}

exports.getFeedback = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.submissionId)
    if (!submission) return res.status(404).json({ message: 'Submission not found' })
    if (submission.student_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' })
    if (submission.status !== 'released') return res.status(403).json({ message: 'Feedback not yet released' })

    const review = submission.ta_reviews?.[0]
    res.json({
      total_score: review?.total_score,
      max_score: submission.assignments?.rubrics?.criteria?.reduce((s, c) => s + c.max_score, 0),
      summary: submission.ai_feedback?.[0]?.summary,
      criteria: review?.criteria ?? submission.ai_feedback?.[0]?.criteria,
      flagged_issues: submission.ai_feedback?.[0]?.flagged_issues,
    })
  } catch (err) {
    next(err)
  }
}
