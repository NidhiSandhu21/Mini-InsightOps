
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth';
import eventRoutes from './routes/events';
import userRoutes from './routes/users';
import { seedData } from './data/seed';
import { loadEvents } from './data/store';

// Initialize App
const app = express();
const PORT = process.env.PORT || 4000;

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, 
    standardHeaders: true, 
    legacyHeaders: false, 
});

// Middleware
app.use(helmet());
app.use(cors({
    origin: '*', // Allow all origins for deployment
    credentials: true
}));
app.use(limiter); // Apply rate limiting to all requests
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/events', eventRoutes);
app.use('/users', userRoutes);

// Root Health Check
app.get('/', (req, res) => {
    res.json({ status: 'ok', service: 'InsightOps Backend' });
});

// Seed Data or Load from Disk
if (loadEvents()) {
    console.log('Data loaded from persistent storage.');
} else {
    console.log('No persistent data found. Seeding initial data...');
    seedData();
}

// Start Server
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
