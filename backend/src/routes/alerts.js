const express = require('express');
const Alert = require('../models/Alert');
const { authRequired } = require('../middleware/auth');
const { ok } = require('../rules/engine');

const router = express.Router();

// GET /api/alerts
router.get('/', authRequired, async (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const filter = {};
  if (req.query.severity) filter.severity = req.query.severity;
  if (req.query.acknowledged != null) filter.acknowledged = req.query.acknowledged === 'true';

  const data = await Alert.find(filter).sort({ timestamp: -1 }).limit(limit);
  res.json(ok(data));
});

// PATCH /api/alerts/:id/ack — marcar como reconocida
router.patch('/:id/ack', authRequired, async (req, res) => {
  const updated = await Alert.findByIdAndUpdate(req.params.id, { acknowledged: true }, { new: true });
  if (!updated) {
    return res.status(404).json({
      status: 'error', code: 'NOT_FOUND', message: 'Alerta no encontrada'
    });
  }
  res.json(ok(updated));
});

module.exports = router;
