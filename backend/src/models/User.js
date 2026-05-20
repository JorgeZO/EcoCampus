const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hash bcrypt
  role:     { type: String, enum: ['admin', 'operador', 'auditor'], default: 'operador' },
  plant:    { type: String, default: 'MetalForge de Occidente' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
