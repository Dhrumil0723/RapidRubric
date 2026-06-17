const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'RapidRubric <noreply@rapidrubric.app>'

async function sendEmail({ to, subject, html }) {
  return resend.emails.send({ from: FROM, to, subject, html })
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
