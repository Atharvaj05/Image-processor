const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const path    = require('path');

const authRoutes  = require('./routes/auth.routes');
const imageRoutes = require('./routes/image.routes');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();

// Security headers (allow serving local images cross-origin)
app.use(helmet({ crossOriginResourcePolicy: false }));

// Allow frontend at :5173 to call backend at :5000
app.use(cors());

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded & transformed images as static files
app.use('/uploads',     express.static(path.join(__dirname, '../uploads')));
app.use('/transformed', express.static(path.join(__dirname, '../transformed')));

// Mount routes
app.use('/api/auth',   authRoutes);
app.use('/api/images', imageRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Server is running' });
});

// Global error handler — must be last
app.use(errorHandler);

module.exports = app;
