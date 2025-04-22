const userList = document.getElementById('userList');
const logoutBtn = document.getElementById('logout');

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  window.location.href = '/index.html';
});

async function fetchUsers() {
  try {
    const res = await fetch('/api/users', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (!res.ok) throw new Error('Session expired');
    const users = await res.json();
    userList.innerHTML = users
      .map(
        user =>
          `<li class="user-item bg-white p-4 rounded-lg shadow-md"><a href="/chat.html?userId=${user._id}&email=${user.email}" class="text-blue-600 font-medium hover:underline">${user.email}</a></li>`
      )
      .join('');
  } catch (error) {
    alert(error.message);
    window.location.href = '/index.html';
  }
}

fetchUsers();