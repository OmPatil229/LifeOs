import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Basic Auth Middleware for local development.
 * Decodes JWT or provides a mock user for testing.
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];

  if (process.env.NODE_ENV === 'development' && !token) {
    // Mock user for easy dev
    (req as any).user = { id: '65f1a2b3c4d5e6f7a8b9c0d1', name: 'Developer' };
    return next();
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};
