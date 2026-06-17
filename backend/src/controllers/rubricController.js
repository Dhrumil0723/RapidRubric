const Rubric = require('../models/Rubric')

exports.list = async (req, res, next) => {
  try {
    const rubrics = await Rubric.findByInstructor(req.user.id)
    res.json(rubrics)
  } catch (err) {
    next(err)
  }
}

exports.create = async (req, res, next) => {
  try {
    const { title, criteria } = req.body
    const rubric = await Rubric.create({ title, criteria, instructorId: req.user.id })
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

    const updated = await Rubric.update(req.params.id, req.body)
    res.json(updated)
  } catch (err) {
    next(err)
  }
}
