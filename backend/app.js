const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const journalRoutes = require('./routes/journalRoutes');
const { errorHandler, notFound } = require('./utils/errorHandler');

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowAllOrigins = process.env.CORS_ALLOW_ALL === 'true';

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

// Apply rate limiting to all routes
app.use(limiter);

// Middleware
app.use(cors({
  origin(origin, callback) {
    // Allow non-browser or same-origin requests
    if (!origin) {
      return callback(null, true);
    }

    // Optional: allow all origins when explicitly enabled
    if (allowAllOrigins) {
      return callback(null, true);
    }

    // Normal allowlist-based CORS
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'AI-Assisted Journal API',
    status: 'OK',
    health: '/health',
    journalApi: '/api/journal'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/journal', journalRoutes);

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

module.exports = app;