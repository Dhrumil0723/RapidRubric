const Anthropic = require('@anthropic-ai/sdk')

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

/**
 * Grade a submission against a rubric using Claude.
 * Returns { criteria: [{id, score, feedback}], flagged_issues: [], summary: '' }
 */
async function gradeSubmission({ submissionText, rubric, previousVersion = null }) {
  const rubricText = rubric.criteria
    .map((c, i) => `${i + 1}. ${c.name} (${c.max_score} pts): ${c.description}`)
    .join('\n')

  const previousSection = previousVersion
    ? `\n\nPREVIOUS SUBMISSION (for version-diff analysis):\n${previousVersion.text}\n\nPREVIOUS FEEDBACK:\n${JSON.stringify(previousVersion.feedback)}`
    : ''

  const prompt = `You are grading a student writing assignment. Evaluate the submission against each rubric criterion and return a JSON response.

RUBRIC:
${rubricText}
${previousSection}

SUBMISSION:
${submissionText}

Return ONLY valid JSON in this exact shape:
{
  "criteria": [
    {
      "id": "<criterion id>",
      "score": <number>,
      "feedback": "<specific feedback>",
      "version_diff": "<improved|regressed|unchanged|null>"
    }
  ],
  "flagged_issues": ["<issue>"],
  "summary": "<2-3 sentence overall summary>"
}`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = message.content[0].text.trim()
  return JSON.parse(raw)
}

/**
 * Summarize class-wide weakness from aggregated feedback.
 */
async function summarizeWeakness({ criterionName, feedbackSamples }) {
  const prompt = `Summarize in 2-3 sentences the common reasons students scored low on the criterion "${criterionName}" based on these TA feedback snippets:\n\n${feedbackSamples.join('\n---\n')}`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  })

  return message.content[0].text.trim()
}

module.exports = { gradeSubmission, summarizeWeakness }
