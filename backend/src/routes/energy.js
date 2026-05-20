const express = require('express');
const EnergyReading = require('../models/EnergyReading');
const Alert = require('../models/Alert');
const { authRequired } = require('../middleware/auth');
const { ok, evaluateThreshold } = require('../rules/engine');

const router = express.Router();

// GET /api/energy — últimas N lecturas
router.get('/', authRequired, async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const data = await EnergyReading.find().sort({ timestamp: -1 }).limit(limit);
  res.json(ok(data));
});

// GET /api/energy/summary — agregado simple para dashboard
router.get('/summary', authRequired, async (req, res) => {
  const readings = await EnergyReading.find().sort({ timestamp: -1 }).limit(96); // 24h * 4 (cada 15 min)
  const total = readings.reduce((s, r) => s + r.value_kwh, 0);
  const avg = readings.length ? total / readings.length : 0;
  const max = readings.reduce((m, r) => Math.max(m, r.value_kwh), 0);
  res.json(ok({
    total_kwh: Number(total.toFixed(2)),
    promedio_kwh: Number(avg.toFixed(2)),
    pico_kwh: Number(max.toFixed(2)),
    muestras: readings.length
  }));
});

// POST /api/energy — registrar nueva lectura (genera alerta si excede umbral)
router.post('/', authRequired, async (req, res) => {
  const { sensor_id, area, value_kwh, threshold, source } = req.body;
  if (!sensor_id || !area || value_kwh == null) {
    return res.status(400).json({
      status: 'error', code: 'MISSING_FIELDS', message: 'sensor_id, area y value_kwh requeridos'
    });
  }

  const reading = await EnergyReading.create({ sensor_id, area, value_kwh, threshold, source });

  // Evaluar contra umbral
  const severity = evaluateThreshold(value_kwh, reading.threshold);
  if (severity) {
    await Alert.create({
      type: 'energia', severity,
      message: `Consumo de ${value_kwh} kWh excede umbral (${reading.threshold}) en ${area}`,
      area, value: value_kwh, threshold: reading.threshold
    });
  }

  res.status(201).json(ok(reading));
});

module.exports = router;
