import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXP = process.env.JWT_EXP || '7d'; // change in prod

export function signJwt(payload: { sub: Types.ObjectId | string; role: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXP });
}

export function verifyJwt<T = any>(token: string): T {
  return jwt.verify(token, JWT_SECRET) as T;
}

