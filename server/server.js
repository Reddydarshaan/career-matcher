/**
 * AI Resume Matcher - Backend Server
 * Express.js server providing APIs for resume parsing, matching, and bullet generation
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const parseResumeRoute = require('./routes/parseResume');
const matchRoute = require('./routes/match');
const bulletsRoute = require('./routes/bullets');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/parse-resume', parseResumeRoute);
app.use('/api/match', matchRoute);
app.use('/api/generate-bullets', bulletsRoute);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║     AI Resume Matcher - Backend Server         ║
╠════════════════════════════════════════════════╣
║  Server running on port ${PORT}                   ║
║  Health: http://localhost:${PORT}/api/health      ║
╚════════════════════════════════════════════════╝
  `);
});

module.exports = app;
