const express = require('express');
const Obligation = require('../models/Obligation');
const { authRequired } = require('../middleware/auth');
const { ok, evaluateObligation } = require('../rules/engine');

const router = express.Router();

// GET /api/compliance/obligations — aplica motor de semáforo en cada llamada
router.get('/', authRequired, async (req, res) => {
  const obligations = await Obligation.find().sort({ due_date: 1 });
  const enriched = obligations.map(o => {
    const obj = o.toObject();
    obj.status = evaluateObligation(obj);
    return obj;
  });
  res.json(ok(enriched));
});

module.exports = router;
