// Motor de reglas: semáforo de cumplimiento y alertas por umbral.

// Clasifica una obligación según su due_date y evidencia
function evaluateObligation(obligation) {
  const today = new Date();
  const due = new Date(obligation.due_date);
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'overdue';
  if (diffDays <= 15) return 'at_risk';
  if (obligation.evidence_url) return 'compliant';
  return 'at_risk';
}

// Determina severidad de una lectura comparada con su umbral
function evaluateThreshold(value, threshold) {
  if (value > threshold * 1.0)   return 'critica';
  if (value > threshold * 0.85)  return 'advertencia';
  return null; // dentro de rango
}

// Respuesta estándar OK
function ok(data) {
  return { status: 'ok', data, timestamp: new Date().toISOString() };
}

// Respuesta estándar ERROR
function fail(code, message, http = 400) {
  return { http, body: { status: 'error', code, message } };
}

module.exports = { evaluateObligation, evaluateThreshold, ok, fail };
