import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

/**
 * REST API Gateway — Performance and Security Wrapper.
 * Modular Express Application serving LifeOS endpoints.
 */
export const createExpressApp = (routes: express.Router): Application => {
  const app = express();

  // Security layer — strict headers for behavioral integrity
  app.use(helmet());
  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  }));

  // Observability layer — performance-focused HTTP logging
  app.use(morgan('dev'));

  // Rate limiting — professional production protection
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500, // Increased for dashboard concurrency
    message: 'Too many requests from this IP.'
  }));

  // Data parsing layer — lean limits for 200ms target
  app.use(express.json({ limit: '16kb' }));
  app.use(express.urlencoded({ extended: true, limit: '16kb' }));
  app.use(cookieParser());

  // Versioned API Routes (v1)
  app.use('/api/v1', routes);

  return app;
};
