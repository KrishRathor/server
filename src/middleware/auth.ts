import type { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization || req.headers.Authorization;

  if (!header) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const parts = (header as string).split(' ');
  const token = parts.length === 2 ? parts[1] : parts[0];

  try {
    const payload = verifyJwt<{ sub: string; role: string }>(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    console.error('Invalid JWT:', err);
    res.status(401).json({ error: 'Invalid token' });
  }
}

