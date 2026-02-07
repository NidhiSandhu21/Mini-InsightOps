
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { users } from '../data/store';
import { z } from 'zod';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

router.post('/login', (req, res) => {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
        return res.status(400).json({ error: 'Invalid input', details: validation.error.issues });
    }

    const { email, password } = validation.data;

    // In a real app, use bcrypt.compare here.
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        return res.status(401).json({ error: 'invalid credentials' });
    }

    // Create JWT
    const token = jwt.sign(
        { email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '8h' }
    );

    return res.json({
        token,
        user: { email: user.email, role: user.role }
    });
});

export default router;
