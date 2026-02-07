
import { Router } from 'express';
import { z } from 'zod';
import { users } from '../data/store';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.use(authMiddleware);

// GET /users - Admin only
router.get('/', requireRole('admin'), (req, res) => {
    // Return users without passwords
    const userList = users.map(({ email, role }) => ({ email, role }));
    res.json(userList);
});

// PUT /users/:email/role - Admin only
const roleSchema = z.object({
    role: z.enum(['admin', 'analyst', 'viewer'])
});

router.put('/:email/role', requireRole('admin'), (req, res) => {
    const targetEmail = req.params.email;
    const user = users.find(u => u.email === targetEmail);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const validation = roleSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ error: 'Invalid role', details: validation.error.issues });
    }

    user.role = validation.data.role;
    res.json({ email: user.email, role: user.role });
});

export default router;
