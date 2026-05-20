// Script de seed: crea usuarios, lecturas, alertas y obligaciones de ejemplo.
// Uso: node src/seed/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const EnergyReading = require('../models/EnergyReading');
const WaterReading = require('../models/WaterReading');
const Alert = require('../models/Alert');
const Obligation = require('../models/Obligation');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecomonitor';

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('[seed] Conectado a Mongo');

  // Limpia las colecciones
  await Promise.all([
    User.deleteMany({}),
    EnergyReading.deleteMany({}),
    WaterReading.deleteMany({}),
    Alert.deleteMany({}),
    Obligation.deleteMany({})
  ]);
  console.log('[seed] Colecciones limpiadas');

  // --- Usuarios ---
  const pass = await bcrypt.hash('demo1234', 10);
  await User.insertMany([
    { name: 'Admin Demo',    email: 'admin@ecomonitor.mx',    password: pass, role: 'admin' },
    { name: 'Operador Demo', email: 'operador@ecomonitor.mx', password: pass, role: 'operador' },
    { name: 'Auditor Demo',  email: 'auditor@ecomonitor.mx',  password: pass, role: 'auditor' }
  ]);
  console.log('[seed] 3 usuarios creados (password: demo1234)');

  // --- Lecturas de energía (últimas 24h, cada 15 min = 96 muestras) ---
  const areas = ['Fundición', 'Acabados', 'Empaque'];
  const energy = [];
  const now = Date.now();
  for (let i = 0; i < 96; i++) {
    const ts = new Date(now - i * 15 * 60 * 1000);
    const area = areas[i % areas.length];
    // valor base + ruido + ocasional pico
    const base = area === 'Fundición' ? 420 : area === 'Acabados' ? 280 : 180;
    const noise = Math.round((Math.random() - 0.5) * 80);
    const spike = i % 17 === 0 ? 220 : 0;
    energy.push({
      sensor_id: `EN-${area.slice(0, 3).toUpperCase()}-01`,
      area, value_kwh: base + noise + spike, threshold: 500, source: 'sensor', timestamp: ts
    });
  }
  await EnergyReading.insertMany(energy);
  console.log(`[seed] ${energy.length} lecturas de energía`);

  // --- Lecturas de agua (24 muestras) ---
  const water = [];
  for (let i = 0; i < 24; i++) {
    const ts = new Date(now - i * 60 * 60 * 1000);
    const area = areas[i % areas.length];
    const base = area === 'Fundición' ? 75 : 45;
    const noise = Math.round((Math.random() - 0.5) * 20);
    const ph = Number((7 + (Math.random() - 0.5) * 2).toFixed(2));
    water.push({
      sensor_id: `AG-${area.slice(0, 3).toUpperCase()}-01`,
      area, value_m3: Math.max(0, base + noise), ph, threshold_m3: 100, source: 'sensor', timestamp: ts
    });
  }
  await WaterReading.insertMany(water);
  console.log(`[seed] ${water.length} lecturas de agua`);

  // --- Alertas iniciales ---
  await Alert.insertMany([
    { type: 'energia', severity: 'critica',     message: 'Consumo de 720 kWh excede umbral (500) en Fundición', area: 'Fundición', value: 720, threshold: 500 },
    { type: 'energia', severity: 'advertencia', message: 'Consumo de 460 kWh cerca del umbral en Acabados',      area: 'Acabados',  value: 460, threshold: 500 },
    { type: 'ph',      severity: 'critica',     message: 'pH 5.8 fuera de rango normativo (6.5 - 8.5) en Empaque', area: 'Empaque', value: 5.8 },
    { type: 'agua',    severity: 'advertencia', message: 'Consumo de 92 m³ cerca del umbral en Fundición',       area: 'Fundición', value: 92, threshold: 100 },
    { type: 'normativa', severity: 'informativa', message: 'Reporte mensual SEMARNAT vence en 12 días' }
  ]);
  console.log('[seed] 5 alertas creadas');

  // --- Obligaciones normativas ---
  const today = new Date();
  const addDays = (d) => new Date(today.getTime() + d * 86400000);
  await Obligation.insertMany([
    { title: 'Reporte de Emisiones Atmosféricas (Cédula de Operación Anual)', entity: 'SEMARNAT', due_date: addDays(35), evidence_url: 'https://demo.minio/coa_2025.pdf' },
    { title: 'Manifiesto de Residuos Peligrosos',                              entity: 'SEMARNAT', due_date: addDays(10) },
    { title: 'Inspección de descargas residuales',                             entity: 'PROFEPA',  due_date: addDays(-3) },
    { title: 'Plan de eficiencia energética',                                  entity: 'CONUEE',   due_date: addDays(60), evidence_url: 'https://demo.minio/pee_2025.pdf' },
    { title: 'Bitácora mensual de consumo eléctrico',                          entity: 'CONUEE',   due_date: addDays(8) }
  ]);
  console.log('[seed] 5 obligaciones creadas');

  console.log('\n[seed] LISTO. Cuentas de prueba:');
  console.log('  admin@ecomonitor.mx    / demo1234  (rol admin)');
  console.log('  operador@ecomonitor.mx / demo1234  (rol operador)');
  console.log('  auditor@ecomonitor.mx  / demo1234  (rol auditor)\n');

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => {
  console.error('[seed] ERROR:', err);
  process.exit(1);
});
