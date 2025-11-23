import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { randomUUID } from 'crypto';

import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import { notFoundHandler, errorHandler } from './utils/errorHandlers.js';
import logger from './utils/logger.js';
import { ApiError, ERROR_CODES } from './utils/errors.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';
const bodyLimit = process.env.BODY_LIMIT || '1mb';
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new ApiError(403, ERROR_CODES.SECURITY_VIOLATION, 'مبدا درخواست مجاز نیست'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};

app.disable('x-powered-by');
app.use(
  pinoHttp({
    logger,
    genReqId: (req) => req.headers['x-request-id'] || randomUUID(),
    customLogLevel(res, err) {
      if (err || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
    serializers: {
      req(request) {
        return { id: request.id, method: request.method, url: request.url, user: request.user?.id };
      },
      res(response) {
        return { statusCode: response.statusCode };
      },
    },
  }),
);
app.use((req, res, next) => {
  if (req.id) res.setHeader('X-Request-Id', req.id);
  next();
});
app.use(helmet());
if (isProduction) {
  app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));
}
app.use(cors(corsOptions));
app.use(express.json({ limit: bodyLimit }));
app.use(express.urlencoded({ extended: false, limit: bodyLimit }));
app.use(limiter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/teams', teamRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

function getMongoOptions() {
  return {
    maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE || 10),
    minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE || 0),
    serverSelectionTimeoutMS: Number(process.env.MONGO_SELECTION_TIMEOUT_MS || 5000),
    socketTimeoutMS: Number(process.env.MONGO_SOCKET_TIMEOUT_MS || 45000),
    retryWrites: true,
  };
}

async function connectWithRetry(attempt = 1) {
  const uri = process.env.MONGODB_URI;
  const maxAttempts = Number(process.env.MONGO_MAX_RETRIES || 5);
  const delayMs = Number(process.env.MONGO_RETRY_DELAY_MS || 2000);
  try {
    await mongoose.connect(uri, getMongoOptions());
    logger.info({ attempt }, 'Connected to MongoDB');
  } catch (error) {
    logger.error({ err: error, attempt }, 'Failed to connect to MongoDB');
    if (attempt >= maxAttempts) {
      throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return connectWithRetry(attempt + 1);
  }
  return null;
}

async function bootstrap() {
  try {
    await connectWithRetry();
    app.listen(PORT, () => {
      logger.info(`API running on port ${PORT}`);
    });
  } catch (error) {
    logger.fatal({ err: error }, 'Failed to start server');
    process.exit(1);
  }
}

bootstrap();

export default app;
