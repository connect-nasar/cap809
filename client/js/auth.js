const form = document.getElementById('authForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const toggleForm = document.getElementById('toggleForm');
const formTitle = document.getElementById('formTitle');
let isLogin = true;

toggleForm.addEventListener('click', () => {
  isLogin = !isLogin;
  formTitle.textContent = isLogin ? 'Login to CAP 809' : 'Signup for CAP 809';
  toggleForm.textContent = isLogin ? 'Switch to Signup' : 'Switch to Login';
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailInput.value, password: passwordInput.value }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    localStorage.setItem('token', data.token);
    window.location.href = '/home.html';
  } catch (error) {
    alert(error.message);
  }
});