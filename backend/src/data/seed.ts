
import { Event, setEvents, EventCategory, EventSeverity } from './store';
import { v4 as uuidv4 } from 'uuid';

const CITIES = [
    { name: 'Mumbai', lat: 19.076, lng: 72.8777 },
    { name: 'Delhi', lat: 28.7041, lng: 77.1025 },
    { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
    { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
    { name: 'Hyderabad', lat: 17.385, lng: 78.4867 },
    { name: 'Pune', lat: 18.5204, lng: 73.8567 },
    { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
    { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
];

const CATEGORIES: EventCategory[] = ['Fraud', 'Ops', 'Safety', 'Sales', 'Health'];

const TAGS_POOL = ['credit-card', 'high-rate', 'suspicious', 'login-fail', 'network-error', 'anomaly', 'large-transaction', 'policy-violation'];

export const seedData = () => {
    const newEvents: Event[] = [];

    // Generate 200 events
    for (let i = 0; i < 200; i++) {
        // Weighted Category
        const catRand = Math.random();
        let category: EventCategory = 'Ops';
        if (catRand < 0.20) category = 'Fraud';
        else if (catRand < 0.45) category = 'Ops';
        else if (catRand < 0.65) category = 'Safety';
        else if (catRand < 0.85) category = 'Sales';
        else category = 'Health';

        // Weighted Severity
        const sevRand = Math.random();
        let severity: EventSeverity = 'Medium';
        if (sevRand < 0.30) severity = 'High';
        else if (sevRand < 0.70) severity = 'Medium';
        else severity = 'Low';

        const city = randomChoice(CITIES);

        const lat = city.lat + (Math.random() - 0.5) * 0.1;
        const lng = city.lng + (Math.random() - 0.5) * 0.1;

        const numTags = Math.floor(Math.random() * 3) + 1;
        const tags: string[] = [];
        for (let j = 0; j < numTags; j++) {
            const t = randomChoice(TAGS_POOL);
            if (!tags.includes(t)) tags.push(t);
        }

        // CORRECT SEED LOGIC (as requested)
        // Distribute over last 90 days
        const daysAgo = Math.floor(Math.random() * 90);
        const d = new Date();
        d.setDate(d.getDate() - daysAgo);
        d.setHours(
            Math.floor(Math.random() * 24),
            Math.floor(Math.random() * 60),
            0,
            0
        );

        // Ensure strictly no future dates
        const now = new Date();
        if (d > now) {
            // If generated date is in future (e.g. later today), clamp to reasonable past time today
            // or just Subtract 24 hours to be safe, or set to now - random minutes
            d.setTime(now.getTime() - Math.floor(Math.random() * 1000 * 60 * 60));
        }

        newEvents.push({
            id: uuidv4(),
            title: `${category} Alert in ${city.name}`,
            description: `Detected potential ${category} issue with severity ${severity}.`,
            category,
            severity,
            createdAt: d.toISOString(),
            location: { lat, lng },
            metrics: {
                score: Math.floor(Math.random() * 101),
                confidence: Number((Math.random() * 0.9 + 0.1).toFixed(2)),
                impact: Math.floor(Math.random() * 11),
            },
            tags,
        });
    }

    setEvents(newEvents);
    console.log(`Seeded ${newEvents.length} events.`);
};

// Simple helpers
function randomChoice<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}
