// EcoMonitor Industrial - API REST
// Backend Node.js + Express + Mongoose
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const energyRoutes = require('./routes/energy');
const waterRoutes = require('./routes/water');
const alertRoutes = require('./routes/alerts');
const obligationRoutes = require('./routes/obligations');
const reportRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecomonitor';

// Middlewares
app.use(cors());
app.use(express.json());

// Health-check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    data: { service: 'ecomonitor-api', uptime: process.uptime() },
    timestamp: new Date().toISOString()
  });
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/energy', energyRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/compliance/obligations', obligationRoutes);
app.use('/api/reports', reportRoutes);

// Manejo de 404
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    code: 'NOT_FOUND',
    message: `Ruta ${req.originalUrl} no encontrada`
  });
});

// Conexión a MongoDB y arranque
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('[OK] Conectado a MongoDB:', MONGO_URI);
    app.listen(PORT, () => {
      console.log(`[OK] EcoMonitor API escuchando en http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('[ERROR] No se pudo conectar a MongoDB:', err.message);
    process.exit(1);
  });
