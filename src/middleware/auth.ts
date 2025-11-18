import { type Request, type Response, type NextFunction } from 'express';
import { verifyJwt } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.header('authorization') || req.header('Authorization');
  if (!auth) return res.status(401).json({ error: 'No token' });

  const parts = auth.split(' ');
  const token = parts.length === 2 ? parts[1] : parts[0];

  try {
    const payload = verifyJwt<{ sub: string; role: string }>(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

