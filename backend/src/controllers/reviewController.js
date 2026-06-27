const Submission = require('../models/Submission')
const AiFeedback = require('../models/AiFeedback')
const Review = require('../models/Review')
const AuditLog = require('../models/AuditLog')
const { sendEmail, templates } = require('../services/emailService')

exports.getQueue = async (req, res, next) => {
  try {
    const submissions = await Submission.findByTAId(req.user.id)
    res.json(submissions.map((s) => ({
      id: s.id,
      status: s.status,
      version_no: s.version_no,
      assignment_title: s.assignments?.title,
      student_name: s.student?.full_name,
      submitted_at: s.created_at,
    })))
  } catch (err) {
    next(err)
  }
}

exports.getReview = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.submissionId)
    if (!submission) return res.status(404).json({ message: 'Submission not found' })
    if (submission.ta_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' })

    const aiFeedback = await AiFeedback.findBySubmissionId(req.params.submissionId)

    res.json({
      submission_id: submission.id,
      assignment_title: submission.assignments?.title,
      student_name: submission.student?.full_name,
      storage_path: submission.storage_path,
      status: submission.status,
      rubric: submission.assignments?.rubrics ?? null,
      ai_feedback: aiFeedback,
    })
  } catch (err) {
    next(err)
  }
}

exports.release = async (req, res, next) => {
  try {
    const { criteria } = req.body
    if (!Array.isArray(criteria) || criteria.length === 0) {
      return res.status(400).json({ message: 'criteria array is required' })
    }
    for (const c of criteria) {
      if (c == null || c.id == null || c.score == null || Number.isNaN(Number(c.score))) {
        return res.status(400).json({ message: 'Each criterion needs an id and a numeric score' })
      }
    }

    const submission = await Submission.findById(req.params.submissionId)
    if (!submission) return res.status(404).json({ message: 'Submission not found' })
    if (submission.ta_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' })
    if (submission.status === 'released') {
      return res.status(409).json({ message: 'Feedback has already been released' })
    }

    const totalScore = criteria.reduce((sum, c) => sum + Number(c.score), 0)

    await Review.create({ submissionId: req.params.submissionId, taId: req.user.id, criteria, totalScore })
    await Submission.updateStatus(req.params.submissionId, 'released')
    await AuditLog.insert({
      actorId: req.user.id,
      action: 'release_feedback',
      targetId: req.params.submissionId,
      metadata: { total_score: totalScore },
    })

    const studentEmail = submission.student?.email
    if (studentEmail) {
      await sendEmail({ to: studentEmail, ...templates.feedbackReleased(submission.assignments?.title) })
    }

    res.json({ ok: true, status: 'released', total_score: totalScore })
  } catch (err) {
    next(err)
  }
}
