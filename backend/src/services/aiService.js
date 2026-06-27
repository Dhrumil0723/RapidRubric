const Anthropic = require("@anthropic-ai/sdk");

const MODEL = "claude-haiku-4-5-20251001";

// Mock mode keeps the full pipeline working without spending Claude credits
// (as planned in the proposal). It activates when no real key is configured
// or MOCK_AI=true is set explicitly.
const apiKey = process.env.ANTHROPIC_API_KEY;
const USE_MOCK =
  process.env.MOCK_AI === "true" ||
  !apiKey ||
  apiKey.includes("dummy") ||
  apiKey === "sk-ant-...";

const client = USE_MOCK ? null : new Anthropic({ apiKey });

function mockGrade(rubric) {
  const criteria = (rubric?.criteria ?? []).map((c) => ({
    id: c.id,
    score: Math.round(c.max_score * 0.8),
    feedback: `[mock] Solid work on "${c.name}". Tighten this section to score higher.`,
    version_diff: null,
  }));
  return {
    criteria,
    flagged_issues: ["[mock] Some claims could use stronger supporting evidence."],
    summary:
      "[mock] A strong draft overall. The main opportunity for improvement is adding more specific evidence and sharpening the thesis.",
  };
}

/**
 * Returns { criteria: [{id, score, feedback, version_diff}], flagged_issues: [], summary: '' }
 */
async function gradeSubmission({ submissionText, rubric, previousVersion = null }) {
  if (USE_MOCK) return mockGrade(rubric);

  const rubricText = rubric.criteria
    .map((c, i) => `${i + 1}. ${c.name} (id: ${c.id}, ${c.max_score} pts): ${c.description}`)
    .join("\n");

  const previousSection = previousVersion
    ? `\n\nPREVIOUS SUBMISSION (for version-diff analysis):\n${previousVersion.text}\n\nPREVIOUS FEEDBACK:\n${JSON.stringify(previousVersion.feedback)}`
    : "";

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
}`;

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = message.content[0].text.trim();
  return JSON.parse(raw);
}

/**
 * Summarize class-wide weakness from aggregated feedback.
 */
async function summarizeWeakness({ criterionName, feedbackSamples }) {
  if (USE_MOCK) {
    return `[mock] Students most often lost marks on "${criterionName}" because of insufficient evidence and unclear explanations.`;
  }

  const prompt = `Summarize in 2-3 sentences the common reasons students scored low on the criterion "${criterionName}" based on these TA feedback snippets:\n\n${feedbackSamples.join("\n---\n")}`;

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  return message.content[0].text.trim();
}

module.exports = { gradeSubmission, summarizeWeakness, USE_MOCK };
