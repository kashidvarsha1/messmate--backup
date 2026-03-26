import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import messRoutes from './routes/messRoutes.js';
import providerRoutes from './routes/providerRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

// ... rest of the code
// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Create express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// ========== ROUTES ==========

// Authentication routes
app.use('/api/auth', authRoutes);

// Mess routes (existing)
app.use('/api/messes', messRoutes);

// Provider routes (new)
app.use('/api/providers', providerRoutes);

// Review routes (new)
app.use('/api/reviews', reviewRoutes);

// Report routes (new)
app.use('/api/reports', reportRoutes);

// ========== HEALTH CHECK ==========

// Root route - Welcome message
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to MessMate AI API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      messes: '/api/messes',
      providers: '/api/providers',
      reviews: '/api/reviews',
      reports: '/api/reports',
      health: '/api/health'
    }
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStatusMessage = dbStatus === 1 ? 'Connected' : 'Disconnected';
  
  res.json({
    success: true,
    status: 'Server is running',
    database: dbStatusMessage,
    timestamp: new Date().toISOString()
  });
});

// ========== ERROR HANDLING ==========

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ========== START SERVER ==========

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ MongoDB connected: ${mongoose.connection.host || 'localhost'}`);
  console.log(`✓ Server started on port http://localhost:${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n📡 Available endpoints:`);
  console.log(`   - GET  /                    - Welcome message`);
  console.log(`   - GET  /api/health          - Health check`);
  console.log(`   - POST /api/auth/register   - Register user`);
  console.log(`   - POST /api/auth/login      - Login user`);
  console.log(`   - GET  /api/auth/me         - Get current user`);
  console.log(`   - GET  /api/providers       - Get all providers`);
  console.log(`   - PUT  /api/providers/:id/status - Update provider status`);
  console.log(`   - POST /api/reviews         - Submit review`);
  console.log(`   - POST /api/reports         - Submit report`);
});