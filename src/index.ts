import express from 'express';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import dotenv from 'dotenv';
import { connectDB } from './db';
dotenv.config();

const app = express();
app.use(express.json());

// basic route
app.get('/', (_req, res) => {
  res.send('✅ LinknRide API is running');
});

// http + socket.io server
const server = http.createServer(app);
const io = new IOServer(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log('🔌 Socket connected:', socket.id);
  socket.on('joinRoom', (room) => socket.join(room));
  socket.on('placeBid', (data) => {
    io.to(data.toUser).emit('newBid', data);
  });
});

const PORT = process.env.PORT || 4000;
connectDB().then(() => {
  server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
