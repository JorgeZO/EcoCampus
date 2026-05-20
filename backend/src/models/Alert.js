const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  type:        { type: String, enum: ['energia', 'agua', 'ph', 'normativa'], required: true },
  severity:    { type: String, enum: ['critica', 'advertencia', 'informativa'], required: true },
  message:     { type: String, required: true },
  area:        { type: String },
  value:       { type: Number },
  threshold:   { type: Number },
  acknowledged:{ type: Boolean, default: false },
  timestamp:   { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);
