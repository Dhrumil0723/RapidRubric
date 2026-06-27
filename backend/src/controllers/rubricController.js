const Rubric = require('../models/Rubric')

// Validates and normalizes the rubric payload. Returns { value } on success
// or { error } with a human-readable message on failure.
function validateRubric({ title, criteria }) {
  if (typeof title !== 'string' || title.trim().length === 0) {
    return { error: 'title is required and must be a non-empty string' }
  }
  if (title.trim().length > 255) {
    return { error: 'title must be 255 characters or fewer' }
  }
  if (!Array.isArray(criteria) || criteria.length === 0) {
    return { error: 'criteria must be a non-empty array' }
  }

  const normalized = []
  for (let i = 0; i < criteria.length; i++) {
    const c = criteria[i]
    if (c == null || typeof c !== 'object') {
      return { error: `criteria[${i}] must be an object` }
    }
    if (typeof c.name !== 'string' || c.name.trim().length === 0) {
      return { error: `criteria[${i}].name is required` }
    }
    const maxScore = Number(c.max_score)
    if (!Number.isFinite(maxScore) || maxScore <= 0) {
      return { error: `criteria[${i}].max_score must be a positive number` }
    }
    normalized.push({
      id: typeof c.id === 'string' && c.id.trim() ? c.id.trim() : `c${i + 1}`,
      name: c.name.trim(),
      description: typeof c.description === 'string' ? c.description.trim() : '',
      max_score: maxScore,
    })
  }

  return { value: { title: title.trim(), criteria: normalized } }
}

exports.list = async (req, res, next) => {
  try {
    const rubrics = await Rubric.findByInstructor(req.user.id)
    res.json(rubrics)
  } catch (err) {
    next(err)
  }
}

exports.getById = async (req, res, next) => {
  try {
    const rubric = await Rubric.findById(req.params.id)
    if (!rubric) return res.status(404).json({ message: 'Rubric not found' })
    if (rubric.instructor_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' })
    res.json(rubric)
  } catch (err) {
    next(err)
  }
}

exports.create = async (req, res, next) => {
  try {
    const { error, value } = validateRubric(req.body ?? {})
    if (error) return res.status(400).json({ message: error })

    const rubric = await Rubric.create({
      title: value.title,
      criteria: value.criteria,
      instructorId: req.user.id,
    })
    res.status(201).json(rubric)
  } catch (err) {
    next(err)
  }
}

exports.update = async (req, res, next) => {
  try {
    const rubric = await Rubric.findById(req.params.id)
    if (!rubric) return res.status(404).json({ message: 'Rubric not found' })
    if (rubric.instructor_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' })
    if (rubric.locked) return res.status(409).json({ message: 'Rubric is locked and cannot be edited' })

    const { error, value } = validateRubric({
      title: req.body?.title ?? rubric.title,
      criteria: req.body?.criteria ?? rubric.criteria,
    })
    if (error) return res.status(400).json({ message: error })

    const updated = await Rubric.update(req.params.id, value)
    res.json(updated)
  } catch (err) {
    next(err)
  }
}
