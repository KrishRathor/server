import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import User, { type Role } from '../models/user';
import { signJwt } from '../utils/jwt';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, consentGiven } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      role?: Role;
      consentGiven?: boolean;
    };

    if (!name || !email || !password || !role) {
      res.status(400).json({ error: 'name, email, password and role are required' });
      return
    }
    if (!['patient', 'provider'].includes(role)) {
      res.status(400).json({ error: 'role must be patient or provider' });
      return
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
      consentGiven: !!consentGiven,
    });

    const token = signJwt({ sub: user._id.toString(), role: user.role });

    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    console.error('Register error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      res.status(400).json({ error: 'email and password required' });
      return
    }



    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return
    }

    if (!user) {
      throw new Error("user is null");
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      res.status(401).json({ error: 'Invalid credentials' });
      return
    }

    const token = signJwt({ sub: user._id.toString(), role: user.role });

    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

