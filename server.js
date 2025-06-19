require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const memeRoutes = require('./routes/memes');
const bidRoutes = require('./routes/bids');
const supabase = require('./config/db');

console.log('memeRoutes:', memeRoutes); // Debug
console.log('bidRoutes:', bidRoutes); // Debug

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'https://meme-hustle-frontend-weld.vercel.app/'],
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173','https://meme-hustle-frontend-weld.vercel.app/'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/memes', memeRoutes);
app.use('/api/bids', bidRoutes);

// Socket.IO events
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));