const express = require('express');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const router = express.Router();

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.get('/', authMiddleware, async (req, res) => {
  const { receiverId } = req.query;
  const messages = await Message.find({
    $or: [
      { sender: req.userId, receiver: receiverId },
      { sender: receiverId, receiver: req.userId },
    ],
  }).sort('timestamp');
  res.json(messages);
});

module.exports = router;