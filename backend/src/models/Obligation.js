const mongoose = require('mongoose');

// Obligaciones normativas (SEMARNAT, PROFEPA, CONUEE)
const obligationSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  entity:       { type: String, enum: ['SEMARNAT', 'PROFEPA', 'CONUEE'], required: true },
  description:  { type: String },
  due_date:     { type: Date, required: true },
  evidence_url: { type: String, default: null },
  status:       { type: String, enum: ['compliant', 'at_risk', 'overdue'], default: 'at_risk' }
}, { timestamps: true });

module.exports = mongoose.model('Obligation', obligationSchema);
