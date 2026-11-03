const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config(); // fallback to current working directory
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');


// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const connectionRoutes = require('./routes/connectionRoutes');
const loadRoutes = require('./routes/loadRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
connectDB();

// Middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../client/dist')));

// Request logging (clean format)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString().substring(11, 19);
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Base API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/loads', loadRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    platform: 'LogiConnect Multi-Role Transport & Freight Logistics Platform',
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});



// Serve Vite build assets from the client/dist folder


// Handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 LogiConnect Freight Server listening on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`======================================================\n`);
});
