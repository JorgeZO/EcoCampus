const express = require('express');
const WaterReading = require('../models/WaterReading');
const Alert = require('../models/Alert');
const { authRequired } = require('../middleware/auth');
const { ok, evaluateThreshold } = require('../rules/engine');

const router = express.Router();

// GET /api/water
router.get('/', authRequired, async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const data = await WaterReading.find().sort({ timestamp: -1 }).limit(limit);
  res.json(ok(data));
});

// GET /api/water/summary
router.get('/summary', authRequired, async (req, res) => {
  const readings = await WaterReading.find().sort({ timestamp: -1 }).limit(24);
  const total = readings.reduce((s, r) => s + r.value_m3, 0);
  const avgPh = readings.length ? readings.reduce((s, r) => s + r.ph, 0) / readings.length : 7;
  res.json(ok({
    total_m3: Number(total.toFixed(2)),
    promedio_ph: Number(avgPh.toFixed(2)),
    muestras: readings.length
  }));
});

// POST /api/water
router.post('/', authRequired, async (req, res) => {
  const { sensor_id, area, value_m3, ph, threshold_m3, source } = req.body;
  if (!sensor_id || !area || value_m3 == null) {
    return res.status(400).json({
      status: 'error', code: 'MISSING_FIELDS', message: 'sensor_id, area y value_m3 requeridos'
    });
  }

  const reading = await WaterReading.create({ sensor_id, area, value_m3, ph, threshold_m3, source });

  const severity = evaluateThreshold(value_m3, reading.threshold_m3);
  if (severity) {
    await Alert.create({
      type: 'agua', severity,
      message: `Consumo de ${value_m3} m³ excede umbral (${reading.threshold_m3}) en ${area}`,
      area, value: value_m3, threshold: reading.threshold_m3
    });
  }

  // Alerta por pH fuera de 6.5 - 8.5 (NOM-001-SEMARNAT)
  if (ph != null && (ph < 6.5 || ph > 8.5)) {
    await Alert.create({
      type: 'ph', severity: 'critica',
      message: `pH ${ph} fuera de rango normativo (6.5 - 8.5) en ${area}`,
      area, value: ph
    });
  }

  res.status(201).json(ok(reading));
});

module.exports = router;
