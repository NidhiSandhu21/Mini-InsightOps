
import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { events, Event, addEvent, updateEvent, deleteEvent } from '../data/store';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

// Validation Schemas
const eventSchema = z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(['Fraud', 'Ops', 'Safety', 'Sales', 'Health']),
    severity: z.enum(['Low', 'Medium', 'High']),
    location: z.object({
        lat: z.number(),
        lng: z.number(),
    }),
    metrics: z.object({
        score: z.number().min(0).max(100),
        confidence: z.number().min(0).max(1),
        impact: z.number().min(0).max(10),
    }),
    tags: z.array(z.string()),
});

// All routes require authentication
router.use(authMiddleware);

// GET /events
router.get('/', (req, res) => {
    let filtered = [...events];
    const { category, severity, minScore, from, to, search, page = '1', limit = '10' } = req.query;

    if (category) {
        filtered = filtered.filter(e => e.category === category);
    }
    if (severity) {
        filtered = filtered.filter(e => e.severity === severity);
    }
    if (minScore) {
        const score = Number(minScore);
        filtered = filtered.filter(e => e.metrics.score >= score);
    }
    // Date range filtering logic with proper AND logic
    if (from) {
        // Parse the date string and ensure it's treated as UTC
        const fromDate = new Date(from as string);
        // Ensure the date is properly parsed and normalized
        if (isNaN(fromDate.getTime())) {
            return res.status(400).json({ error: 'Invalid from date format' });
        }
        
        // If 'to' is not provided but 'from' is, set 'to' to current date for proper range
        if (!to) {
            const toDate = new Date();
            toDate.setUTCHours(23, 59, 59, 999); // End of today in UTC
            // Apply date range filtering with AND logic
            filtered = filtered.filter(e => {
                const eventTime = new Date(e.createdAt).getTime();
                return eventTime >= fromDate.getTime() && eventTime <= toDate.getTime();
            });
        } else {
            // Both from and to provided
            const toDate = new Date(to as string);
            if (isNaN(toDate.getTime())) {
                return res.status(400).json({ error: 'Invalid to date format' });
            }
            
            filtered = filtered.filter(e => {
                const eventTime = new Date(e.createdAt).getTime();
                return eventTime >= fromDate.getTime() && eventTime <= toDate.getTime();
            });
        }
    } else if (to) {
        // Only 'to' provided
        const toDate = new Date(to as string);
        if (isNaN(toDate.getTime())) {
            return res.status(400).json({ error: 'Invalid to date format' });
        }
        
        filtered = filtered.filter(e => new Date(e.createdAt).getTime() <= toDate.getTime());
    }
    if (search) {
        const term = (search as string).toLowerCase();
        filtered = filtered.filter(e =>
            e.title.toLowerCase().includes(term) ||
            e.tags.some(t => t.toLowerCase().includes(term))
        );
    }

    // Sort by createdAt DESC (Newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Pagination
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit))); 
    const total = filtered.length;
    const start = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(start, start + limitNum);

    res.json({
        events: paginated,
        total,
        page: pageNum,
        limit: limitNum
    });
});

// GET /events/:id
router.get('/:id', (req, res) => {
    const event = events.find(e => e.id === req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
});

// POST /events - Admin & Analyst
router.post('/', requireRole('admin', 'analyst'), (req, res) => {
    const validation = eventSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ error: 'Invalid input', details: validation.error.issues });
    }

    const newEvent: Event = {
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        ...validation.data
    };

    addEvent(newEvent);
    res.status(201).json(newEvent);
});

// PUT /events/:id - Admin & Analyst
router.put('/:id', requireRole('admin', 'analyst'), (req, res) => {
    const validation = eventSchema.partial().safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ error: 'Invalid input', details: validation.error.issues });
    }

    const updatedEvent = updateEvent(req.params.id as string, validation.data);
    if (!updatedEvent) {
        return res.status(404).json({ error: 'Event not found' });
    }

    res.json(updatedEvent);
});

// DELETE /events/:id - Admin only
router.delete('/:id', requireRole('admin'), (req, res) => {
    const success = deleteEvent(req.params.id as string);
    if (!success) {
        return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Event deleted' });
});

export default router;
