export type EventCategory = 'Fraud' | 'Ops' | 'Safety' | 'Sales' | 'Health';
export type EventSeverity = 'Low' | 'Medium' | 'High';

export interface Event {
    id: string;
    title: string;
    description: string;
    category: EventCategory;
    severity: EventSeverity;
    location: {
        lat: number;
        lng: number;
    };
    metrics: {
        score: number;
        confidence: number;
        impact: number;
    };
    tags: string[];
    createdAt: string;
    updatedAt?: string;
}
