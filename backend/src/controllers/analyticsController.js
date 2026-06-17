const Analytics = require('../models/Analytics')
const { summarizeWeakness } = require('../services/aiService')

exports.getSummary = async (req, res, next) => {
  try {
    const summary = await Analytics.getSummary(req.user.id)
    res.json(summary)
  } catch (err) {
    next(err)
  }
}

exports.getAnalytics = async (req, res, next) => {
  try {
    const weakCriteria = await Analytics.getWeakCriteria(req.user.id)

    let aiSummary = null
    if (weakCriteria?.length > 0) {
      aiSummary = await summarizeWeakness({
        criterionName: weakCriteria[0].criterion_name,
        feedbackSamples: weakCriteria[0].feedback_samples ?? [],
      })
    }

    res.json({
      weak_criteria: weakCriteria?.map((c) => ({
        criterion_id: c.criterion_id,
        name: c.criterion_name,
        mean_score: c.mean_score,
        max_score: c.max_score,
      })),
      ai_summary: aiSummary,
    })
  } catch (err) {
    next(err)
  }
}
