const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const Message = require('./models/Message');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client', 'index.html'));
});

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

io.on('connection', (socket) => {
  socket.on('join', ({ userId }) => {
    socket.join(userId);
  });

  socket.on('sendMessage', async ({ senderId, receiverId, content }) => {
    const message = new Message({ sender: senderId, receiver: receiverId, content });
    await message.save();
    io.to(receiverId).emit('receiveMessage', { ...message._doc, timestamp: message.timestamp });
    io.to(senderId).emit('receiveMessage', { ...message._doc, timestamp: message.timestamp });
  });
});

server.listen(process.env.PORT || 3000, () => console.log('Server running on port 3000'));
