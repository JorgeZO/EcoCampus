const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ecomonitor_demo_secret';

// Verifica el JWT en el header Authorization: Bearer <token>
function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      status: 'error', code: 'NO_TOKEN', message: 'Token requerido'
    });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({
      status: 'error', code: 'INVALID_TOKEN', message: 'Token inválido o expirado'
    });
  }
}

// Restringe el acceso a ciertos roles
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error', code: 'FORBIDDEN', message: 'Permisos insuficientes'
      });
    }
    next();
  };
}

module.exports = { authRequired, requireRole, JWT_SECRET };
