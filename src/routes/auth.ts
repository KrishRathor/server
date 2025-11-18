import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import User, { type Role } from '../models/user';
import { signJwt } from '../utils/jwt';
import { authMiddleware, type AuthRequest } from '../middleware/auth';

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

router.post('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('-passwordHash');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      consentGiven: user.consentGiven,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error('Me route error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/editname', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body as { name?: string };
    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ error: 'name is required' });
      return;
    }

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name: name.trim() },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    console.error('Change name error:', err);
    if (!res.headersSent) res.status(500).json({ error: 'Server error' });
  }
});

router.post('/editemail', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'email is required' });
      return;
    }
    if (!password || typeof password !== 'string') {
      res.status(400).json({ error: 'current password is required to change email' });
      return;
    }

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      res.status(401).json({ error: 'Invalid password' });
      return;
    }

    const normalized = email.toLowerCase().trim();
    if (normalized === user.email) {
      res.status(400).json({ error: 'New email must be different' });
      return;
    }

    const exists = await User.findOne({ email: normalized });
    if (exists) {
      res.status(409).json({ error: 'Email already in use' });
      return;
    }

    user.email = normalized;
    await user.save();

    const out = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.json(out);
  } catch (err) {
    console.error('Change email error:', err);
    if (!res.headersSent) res.status(500).json({ error: 'Server error' });
  }
});



export default router;

