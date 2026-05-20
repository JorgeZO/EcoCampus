requireAuth();
const user = getUser();
document.getElementById('userBadge').textContent = user ? `${user.name} · ${user.role}` : '';

document.getElementById('logoutBtn').addEventListener('click', () => {
  clearSession();
  window.location.href = 'index.html';
});

function fmtTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString('es-MX', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' });
}

function badge(text, type) {
  return `<span class="badge ${type}">${text}</span>`;
}

async function loadAll() {
  try {
    const [energy, water, alerts, oblig, metrics] = await Promise.all([
      api('/energy?limit=48'),
      api('/water?limit=24'),
      api('/alerts?limit=10'),
      api('/compliance/obligations'),
      api('/reports/metrics')
    ]);

    // KPIs
    const m = metrics.data;
    document.getElementById('kpiEnergy').textContent = m.energia.total_kwh.toLocaleString('es-MX');
    document.getElementById('kpiPeak').textContent   = m.energia.pico_kwh.toLocaleString('es-MX');
    document.getElementById('kpiWater').textContent  = m.agua.total_m3.toLocaleString('es-MX');
    document.getElementById('kpiPh').textContent     = m.agua.promedio_ph;
    document.getElementById('kpiAlerts').textContent = m.alertas.criticas;
    document.getElementById('kpiAtRisk').textContent = m.cumplimiento.at_risk + m.cumplimiento.overdue;
    document.getElementById('kpiObTotal').textContent = m.cumplimiento.total;

    // Gráficas
    const eData = energy.data.slice().reverse();
    const wData = water.data.slice().reverse();

    new Chart(document.getElementById('energyChart'), {
      type: 'line',
      data: {
        labels: eData.map(r => new Date(r.timestamp).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })),
        datasets: [{
          label: 'kWh',
          data: eData.map(r => r.value_kwh),
          borderColor: '#1f3a8a', backgroundColor: 'rgba(31,58,138,.1)',
          fill: true, tension: .3, pointRadius: 0
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } }
      }
    });

    new Chart(document.getElementById('waterChart'), {
      type: 'bar',
      data: {
        labels: wData.map(r => new Date(r.timestamp).toLocaleTimeString('es-MX', { hour: '2-digit' })),
        datasets: [{ label: 'm³', data: wData.map(r => r.value_m3), backgroundColor: '#4f6dc4' }]
      },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
    });

    // Tabla de alertas
    const ab = document.getElementById('alertsBody');
    ab.innerHTML = alerts.data.length
      ? alerts.data.map(a => `
        <tr>
          <td>${badge(a.severity, a.severity)}</td>
          <td>${a.type}</td>
          <td>${a.area || '—'}</td>
          <td>${a.message}</td>
          <td>${fmtTime(a.timestamp)}</td>
        </tr>`).join('')
      : '<tr><td colspan="5" class="muted">Sin alertas</td></tr>';

    // Tabla de obligaciones
    const ob = document.getElementById('obligationsBody');
    ob.innerHTML = oblig.data.length
      ? oblig.data.map(o => `
        <tr>
          <td>${badge(o.status, o.status)}</td>
          <td>${o.entity}</td>
          <td>${o.title}</td>
          <td>${new Date(o.due_date).toLocaleDateString('es-MX')}</td>
        </tr>`).join('')
      : '<tr><td colspan="4" class="muted">Sin obligaciones</td></tr>';

  } catch (err) {
    console.error(err);
    alert('Error cargando datos: ' + err.message);
    if (err.status === 401) { clearSession(); window.location.href = 'index.html'; }
  }
}

loadAll();
