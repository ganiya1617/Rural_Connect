'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const { connectDB } = require('./db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const mentorRoutes = require('./routes/mentors');
const resourceRoutes = require('./routes/resources');
const mentorshipRoutes = require('./routes/mentorship');
const quizRoutes = require('./routes/quizzes');
const opportunityRoutes = require('./routes/opportunities');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..', 'public')));

// ─── Health & Welcome ─────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is healthy', timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api', (req, res) => {
  res.json({
    message: 'RuralConnect API v1',
    version: '1.0.0',
    endpoints: [
      '/api/auth',
      '/api/students',
      '/api/mentors',
      '/api/resources',
      '/api/mentorship',
      '/api/quizzes',
      '/api/opportunities',
      '/api/admin',
    ],
  });
});

// ─── Serve Frontend Pages ─────────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Page routes
const pages = [
  'login', 'register', 'dashboard', 'resources', 'mentors',
  'quizzes', 'scholarships', 'jobs', 'profile', 'progress',
  'mentor-dashboard', 'admin',
];

pages.forEach(page => {
  app.get(`/${page}`, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'pages', `${page}.html`));
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────

app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API route not found' });
  }
  res.status(404).sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ─── Error Handler ────────────────────────────────────────────────────────────

app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────

async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 RuralConnect running on http://localhost:${PORT}`);
  });
}

startServer();

module.exports = app;
