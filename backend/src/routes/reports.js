const express = require('express');
const EnergyReading = require('../models/EnergyReading');
const WaterReading = require('../models/WaterReading');
const Alert = require('../models/Alert');
const Obligation = require('../models/Obligation');
const { authRequired } = require('../middleware/auth');
const { ok, evaluateObligation } = require('../rules/engine');

const router = express.Router();

// GET /api/reports/metrics — consolidado de métricas listo para el reporte imprimible
router.get('/metrics', authRequired, async (req, res) => {
  // Energía: últimas 96 lecturas (24h)
  const energyReadings = await EnergyReading.find().sort({ timestamp: -1 }).limit(96);
  const energyTotal = energyReadings.reduce((s, r) => s + r.value_kwh, 0);
  const energyAvg = energyReadings.length ? energyTotal / energyReadings.length : 0;
  const energyMax = energyReadings.reduce((m, r) => Math.max(m, r.value_kwh), 0);

  // Agua: últimas 24 lecturas (24h)
  const waterReadings = await WaterReading.find().sort({ timestamp: -1 }).limit(24);
  const waterTotal = waterReadings.reduce((s, r) => s + r.value_m3, 0);
  const waterPhAvg = waterReadings.length
    ? waterReadings.reduce((s, r) => s + r.ph, 0) / waterReadings.length
    : 7;

  // Alertas por severidad
  const alertCritica = await Alert.countDocuments({ severity: 'critica' });
  const alertAdv = await Alert.countDocuments({ severity: 'advertencia' });
  const alertInfo = await Alert.countDocuments({ severity: 'informativa' });

  // Cumplimiento normativo
  const obligations = await Obligation.find();
  let compliant = 0, atRisk = 0, overdue = 0;
  obligations.forEach(o => {
    const st = evaluateObligation(o);
    if (st === 'compliant') compliant++;
    else if (st === 'at_risk') atRisk++;
    else if (st === 'overdue') overdue++;
  });

  res.json(ok({
    generado_en: new Date().toISOString(),
    planta: 'MetalForge de Occidente',
    energia: {
      total_kwh: Number(energyTotal.toFixed(2)),
      promedio_kwh: Number(energyAvg.toFixed(2)),
      pico_kwh: Number(energyMax.toFixed(2)),
      muestras: energyReadings.length
    },
    agua: {
      total_m3: Number(waterTotal.toFixed(2)),
      promedio_ph: Number(waterPhAvg.toFixed(2)),
      muestras: waterReadings.length
    },
    alertas: {
      criticas: alertCritica,
      advertencias: alertAdv,
      informativas: alertInfo,
      total: alertCritica + alertAdv + alertInfo
    },
    cumplimiento: {
      compliant, at_risk: atRisk, overdue,
      total: obligations.length
    }
  }));
});

module.exports = router;
