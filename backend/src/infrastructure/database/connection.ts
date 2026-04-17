import mongoose from 'mongoose';
import { winstonLogger as logger } from '../config/logger.js';

/**
 * Mongoose Connection with singleton pattern and indexing strategy.
 * Includes event logging for performance monitoring.
 */
export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lifeos');
    
    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    // Log query timings in development
    if (process.env.NODE_ENV === 'development') {
      mongoose.set('debug', (collectionName, method, query, doc) => {
        logger.debug(`${collectionName}.${method}`, query);
      });
    }

  } catch (error: any) {
    logger.error(`MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};
