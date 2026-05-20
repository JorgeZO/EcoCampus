const mongoose = require('mongoose');

// Lecturas de energía (kWh) por sensor cada 15 minutos
const energyReadingSchema = new mongoose.Schema({
  sensor_id:  { type: String, required: true },
  area:       { type: String, required: true },        // ej: "Fundición", "Acabados"
  value_kwh:  { type: Number, required: true },
  threshold:  { type: Number, default: 500 },          // umbral configurable
  source:     { type: String, enum: ['sensor', 'manual'], default: 'sensor' },
  timestamp:  { type: Date, default: Date.now }
}, { timestamps: true });

energyReadingSchema.index({ timestamp: -1 });

module.exports = mongoose.model('EnergyReading', energyReadingSchema);
