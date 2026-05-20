const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');
const { ok } = require('../rules/engine');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      status: 'error', code: 'MISSING_FIELDS', message: 'email y password requeridos'
    });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({
      status: 'error', code: 'INVALID_CREDENTIALS', message: 'Credenciales incorrectas'
    });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({
      status: 'error', code: 'INVALID_CREDENTIALS', message: 'Credenciales incorrectas'
    });
  }

  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json(ok({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, plant: user.plant }
  }));
});

// GET /api/auth/me — devuelve el usuario actual (útil para el frontend)
const { authRequired } = require('../middleware/auth');
router.get('/me', authRequired, (req, res) => {
  res.json(ok({ user: req.user }));
});

module.exports = router;
