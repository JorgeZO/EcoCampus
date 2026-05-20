const mongoose = require('mongoose');

// Lecturas de agua (m³, pH) por hora
const waterReadingSchema = new mongoose.Schema({
  sensor_id:    { type: String, required: true },
  area:         { type: String, required: true },
  value_m3:     { type: Number, required: true },
  ph:           { type: Number, default: 7.0 },
  threshold_m3: { type: Number, default: 100 },
  source:       { type: String, enum: ['sensor', 'manual'], default: 'sensor' },
  timestamp:    { type: Date, default: Date.now }
}, { timestamps: true });

waterReadingSchema.index({ timestamp: -1 });

module.exports = mongoose.model('WaterReading', waterReadingSchema);
