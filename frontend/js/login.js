document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errBox = document.getElementById('loginError');
  errBox.hidden = true;

  try {
    const res = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setSession(res.data.token, res.data.user);
    window.location.href = 'dashboard.html';
  } catch (err) {
    errBox.textContent = err.message || 'No se pudo iniciar sesión';
    errBox.hidden = false;
  }
});
