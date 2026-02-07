
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

export interface AuthUser {
    email: string;
    role: 'admin' | 'analyst' | 'viewer';
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;

        // Look up fresh user details to ensure role is current 
        const { users } = require('../data/store');
        const freshUser = users.find((u: any) => u.email === decoded.email);

        if (freshUser) {
            req.user = { email: freshUser.email, role: freshUser.role };
        } else {
            // Fallback if user deleted
            return res.status(401).json({ error: 'User no longer exists' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
