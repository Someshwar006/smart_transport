const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config(); // fallback to current working directory
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const connectionRoutes = require('./routes/connectionRoutes');
const loadRoutes = require('./routes/loadRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
connectDB();

// CORS Configuration
const allowedOrigins = [
  'https://smart-transport-f0xg.onrender.com',
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        origin.endsWith('.onrender.com') ||
        allowedOrigins.includes('*')
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive fallback while supporting credentials
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (clean format)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString().substring(11, 19);
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// 1. Base API Routes (must be registered first)
app.use('/api/auth', authRoutes);
app.use('/api', authRoutes); // alias for /api/login, /api/register
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

// 2. Unmatched API routes 404 handler (strictly for /api/*, prevents breaking client SPA routes)
app.all('/api/*', (req, res) => {
  res.status(404).json({ message: `API route ${req.originalUrl} not found` });
});

// 3. Serve frontend static build files (client/dist)
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// 4. Express SPA Catch-All Handler:
// Serves index.html for all non-API GET requests so client-side React Router works on refresh/direct navigation
app.get('*', (req, res) => {
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).json({ message: `Route ${req.originalUrl} not found` });
    }
  });
});

// 5. Non-GET 404 Handler for unmatched non-API routes
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// 6. Central Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 LogiConnect Freight Server listening on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`======================================================\n`);
});
