requireAuth();

document.getElementById('printBtn').addEventListener('click', () => window.print());

async function loadReport() {
  try {
    const res = await api('/reports/metrics');
    const m = res.data;

    document.getElementById('rPlanta').textContent = m.planta;
    document.getElementById('rGenerado').textContent = new Date(m.generado_en).toLocaleString('es-MX');

    document.getElementById('rEnergyTotal').textContent = m.energia.total_kwh.toLocaleString('es-MX');
    document.getElementById('rEnergyAvg').textContent   = m.energia.promedio_kwh.toLocaleString('es-MX');
    document.getElementById('rEnergyPeak').textContent  = m.energia.pico_kwh.toLocaleString('es-MX');
    document.getElementById('rEnergyN').textContent     = m.energia.muestras;
    document.getElementById('rEnergyN2').textContent    = m.energia.muestras;

    document.getElementById('rWaterTotal').textContent  = m.agua.total_m3.toLocaleString('es-MX');
    document.getElementById('rWaterPh').textContent     = m.agua.promedio_ph;
    document.getElementById('rWaterN').textContent      = m.agua.muestras;
    document.getElementById('rWaterN2').textContent     = m.agua.muestras;

    document.getElementById('rAlertCrit').textContent  = m.alertas.criticas;
    document.getElementById('rAlertAdv').textContent   = m.alertas.advertencias;
    document.getElementById('rAlertInfo').textContent  = m.alertas.informativas;
    document.getElementById('rAlertTotal').textContent = m.alertas.total;

    document.getElementById('rObComp').textContent  = m.cumplimiento.compliant;
    document.getElementById('rObRisk').textContent  = m.cumplimiento.at_risk;
    document.getElementById('rObOver').textContent  = m.cumplimiento.overdue;
    document.getElementById('rObTotal').textContent = m.cumplimiento.total;
  } catch (err) {
    alert('Error cargando reporte: ' + err.message);
    if (err.status === 401) { clearSession(); window.location.href = 'index.html'; }
  }
}

loadReport();
