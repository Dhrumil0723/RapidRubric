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
      assignment_title: s.assignments?.title,
      student_name: s.profiles?.name,
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
      assignment_title: submission.assignments?.title,
      student_name: submission.profiles?.name,
      storage_path: submission.storage_path,
      ai_feedback: aiFeedback,
    })
  } catch (err) {
    next(err)
  }
}

exports.release = async (req, res, next) => {
  try {
    const { criteria } = req.body
    const submission = await Submission.findById(req.params.submissionId)
    if (!submission) return res.status(404).json({ message: 'Submission not found' })
    if (submission.ta_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' })

    const totalScore = criteria.reduce((sum, c) => sum + Number(c.score), 0)

    await Review.create({ submissionId: req.params.submissionId, taId: req.user.id, criteria, totalScore })
    await Submission.updateStatus(req.params.submissionId, 'released')
    await AuditLog.insert({ actorId: req.user.id, action: 'release_feedback', targetId: req.params.submissionId })

    if (submission.profiles?.email) {
      await sendEmail({ to: submission.profiles.email, ...templates.feedbackReleased(submission.assignments?.title) })
    }

    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
}
