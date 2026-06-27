const { Resend } = require('resend')

const apiKey = process.env.RESEND_API_KEY
const resend = apiKey ? new Resend(apiKey) : null
const FROM = 'RapidRubric <noreply@rapidrubric.app>'

// Notifications are best-effort: a delivery failure (or no configured key)
// must never break the grading pipeline, so failures are logged, not thrown.
async function sendEmail({ to, subject, html }) {
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set — skipping email to ${to}`)
    return { skipped: true }
  }
  try {
    return await resend.emails.send({ from: FROM, to, subject, html })
  } catch (err) {
    console.error(`[email] Failed to send "${subject}" to ${to}:`, err.message)
    return { error: err.message }
  }
}

const templates = {
  submissionReceived: (studentName, assignmentTitle) => ({
    subject: `New submission: ${assignmentTitle}`,
    html: `<p>A new submission from <strong>${studentName}</strong> for <strong>${assignmentTitle}</strong> is in your review queue.</p>`,
  }),
  feedbackReleased: (assignmentTitle) => ({
    subject: `Feedback released for ${assignmentTitle}`,
    html: `<p>Your TA has released feedback for <strong>${assignmentTitle}</strong>. Sign in to RapidRubric to view it.</p>`,
  }),
  taAssigned: (assignmentTitle) => ({
    subject: `You have been assigned to grade ${assignmentTitle}`,
    html: `<p>You have been assigned to review submissions for <strong>${assignmentTitle}</strong>.</p>`,
  }),
  gradingComplete: (assignmentTitle) => ({
    subject: `All submissions graded: ${assignmentTitle}`,
    html: `<p>All submissions for <strong>${assignmentTitle}</strong> have been graded and released.</p>`,
  }),
}

module.exports = { sendEmail, templates }
