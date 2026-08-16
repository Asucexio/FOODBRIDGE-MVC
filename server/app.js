const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');
const authRoutes = require('./routes/authRoutes');
const donationRoutes = require('./routes/donationRoutes');
const claimRoutes = require('./routes/claimRoutes');
const { version } = require('./package.json');

const app = express();

// Trust proxy when behind a reverse proxy (Render, Railway, etc.)
app.set('trust proxy', 1);

// Security & performance
app.use(helmet());
app.use(compression());

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});
app.use('/api/', apiLimiter);

// Stricter auth rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many auth attempts, please try again later.' },
});
app.use('/api/auth/', authLimiter);

// Body parsing with reasonable limits
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

// Request timeout
app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    res.status(408).json({ message: 'Request timeout.' });
  });
  next();
});

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'FoodBridge API',
    version,
    environment: env.nodeEnv,
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req, res) => {
  res.json({
    name: 'FoodBridge API',
    version,
    environment: env.nodeEnv,
    health: '/health',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/claims', claimRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found.',
    path: req.path,
    method: req.method,
  });
});

// Global error handler
app.use((error, req, res, next) => {
  const status = error.status || 500;

  if (env.nodeEnv === 'development') {
    console.error('[Error]', error);
  }

  const response = {
    message: error.message || 'Internal server error.',
    ...(error.code && { code: error.code }),
    ...(env.nodeEnv === 'development' && { stack: error.stack }),
  };

  res.status(status).json(response);
});

module.exports = app;