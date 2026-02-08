import dotenv from 'dotenv';

// Load environment variables FIRST, before any other imports
dotenv.config();

import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { db } from './configs/firebase.js';

// Import routes
import authRoutes from './routes/authRoute.js';
import boardRoutes from './routes/boardRoute.js';
import cardRoutes from './routes/cardRoute.js';
import taskRoutes from './routes/taskRoute.js';
import githubRoutes from './routes/githubRoute.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/boards', boardRoutes);
app.use('/github', githubRoutes);

// Nested routes - Cards under boards
app.use('/boards/:boardId/cards', cardRoutes);

// Nested routes - Tasks under cards
app.use('/boards/:boardId/cards/:id/tasks', taskRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Firebase health check endpoint
app.get('/health-firebase', async (req, res) => {
  try {
    // Test Firestore connection by trying to get a collection count
    const usersCollection = await db.collection('users').limit(1).get();
    
    res.json({
      status: 'OK',
      firebase: 'connected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'Firestore'
    });
  } catch (error) {
    console.error('Firebase connection failed:', error.message);
    res.status(503).json({
      status: 'ERROR',
      firebase: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Mini Trello API',
    version: '1.0.0',
    endpoints: {
      auth: '/auth',
      boards: '/boards',
      cards: '/boards/:boardId/cards',
      tasks: '/boards/:boardId/cards/:id/tasks',
      github: '/github',
      health: '/health',
      healthFirebase: '/health-firebase'
    }
  });
});

// Socket.io - Real-time updates
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join board room
  socket.on('join-board', (boardId) => {
    socket.join(`board-${boardId}`);
    console.log(`User ${socket.id} joined board ${boardId}`);
    
    // Notify others in the room
    socket.to(`board-${boardId}`).emit('user-joined', {
      socketId: socket.id,
      timestamp: new Date().toISOString()
    });
  });

  // Leave board room
  socket.on('leave-board', (boardId) => {
    socket.leave(`board-${boardId}`);
    console.log(`User ${socket.id} left board ${boardId}`);
    
    // Notify others
    socket.to(`board-${boardId}`).emit('user-left', {
      socketId: socket.id,
      timestamp: new Date().toISOString()
    });
  });

  // Board updates
  socket.on('board-update', (data) => {
    console.log('Board update:', data);
    socket.to(`board-${data.boardId}`).emit('board-updated', {
      ...data,
      timestamp: new Date().toISOString()
    });
  });

  // Card updates
  socket.on('card-update', (data) => {
    console.log('Card update:', data);
    socket.to(`board-${data.boardId}`).emit('card-updated', {
      ...data,
      timestamp: new Date().toISOString()
    });
  });

  // Card created
  socket.on('card-created', (data) => {
    console.log('Card created:', data);
    socket.to(`board-${data.boardId}`).emit('card-created', {
      ...data,
      timestamp: new Date().toISOString()
    });
  });

  // Card deleted
  socket.on('card-deleted', (data) => {
    console.log('Card deleted:', data);
    socket.to(`board-${data.boardId}`).emit('card-deleted', {
      ...data,
      timestamp: new Date().toISOString()
    });
  });

  // Task updates
  socket.on('task-update', (data) => {
    console.log('Task update:', data);
    socket.to(`board-${data.boardId}`).emit('task-updated', {
      ...data,
      timestamp: new Date().toISOString()
    });
  });

  // Task created
  socket.on('task-created', (data) => {
    console.log('Task created:', data);
    socket.to(`board-${data.boardId}`).emit('task-created', {
      ...data,
      timestamp: new Date().toISOString()
    });
  });

  // Task deleted
  socket.on('task-deleted', (data) => {
    console.log('Task deleted:', data);
    socket.to(`board-${data.boardId}`).emit('task-deleted', {
      ...data,
      timestamp: new Date().toISOString()
    });
  });

  // Task moved (drag & drop)
  socket.on('task-moved', (data) => {
    console.log('Task moved:', data);
    socket.to(`board-${data.boardId}`).emit('task-moved', {
      ...data,
      timestamp: new Date().toISOString()
    });
  });

  // Task assigned
  socket.on('task-assigned', (data) => {
    console.log('Task assigned:', data);
    socket.to(`board-${data.boardId}`).emit('task-assigned', {
      ...data,
      timestamp: new Date().toISOString()
    });
  });

  // User typing indicator
  socket.on('typing', (data) => {
    socket.to(`board-${data.boardId}`).emit('user-typing', {
      socketId: socket.id,
      ...data
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // Error handling
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(isDevelopment && { stack: err.stack })
  });
});

app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});


process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('================================');
  console.log(`Server đang chạy trên port ${PORT}`);
  console.log('================================');
  console.log(`API Health Check: http://localhost:${PORT}/health`);
  console.log(`Firebase Health Check: http://localhost:${PORT}/health-firebase`);
  console.log(`API Documentation: http://localhost:${PORT}/`);
  console.log('================================');
});

// Export for testing
export { app, io };