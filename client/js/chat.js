const socket = io();
const chatBox = document.getElementById('chatBox');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const backBtn = document.getElementById('back');
const chatWith = document.getElementById('chatWith');

const urlParams = new URLSearchParams(window.location.search);
const receiverId = urlParams.get('userId');
const receiverEmail = urlParams.get('email');
chatWith.textContent = `Chat with ${receiverEmail}`;

backBtn.addEventListener('click', () => {
  window.location.href = '/home.html';
});

let userId;
try {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');
  userId = JSON.parse(atob(token.split('.')[1])).userId;
  localStorage.setItem('userId', userId);
  socket.emit('join', { userId });
} catch (error) {
  alert('Session expired. Please log in again.');
  window.location.href = '/index.html';
}

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const content = messageInput.value.trim();
  if (!content) return;
  socket.emit('sendMessage', {
    senderId: userId,
    receiverId,
    content,
  });
  messageInput.value = '';
});

socket.on('receiveMessage', (message) => {
  const isSent = message.sender.toString() === userId;
  const div = document.createElement('div');
  div.className = `message ${isSent ? 'sent' : 'received'}`;
  div.innerHTML = `
    <div>${message.content}</div>
    <div class="timestamp">${new Date(message.timestamp).toLocaleTimeString()}</div>
  `;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
});

async function loadChatHistory() {
  try {
    const res = await fetch(`/api/messages?receiverId=${receiverId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (!res.ok) throw new Error('Failed to load chat history');
    const messages = await res.json();
    messages.forEach(message => {
      const isSent = message.sender.toString() === userId;
      const div = document.createElement('div');
      div.className = `message ${isSent ? 'sent' : 'received'}`;
      div.innerHTML = `
        <div>${message.content}</div>
        <div class="timestamp">${new Date(message.timestamp).toLocaleTimeString()}</div>
      `;
      chatBox.appendChild(div);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (error) {
    alert('Error loading chat history: ' + error.message);
  }
}

loadChatHistory();
