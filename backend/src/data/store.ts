import fs from "fs";
import path from "path";

export interface User {
  email: string;
  password: string; // Stored in plaintext as per simplified requirements
  role: "admin" | "analyst" | "viewer";
}

export type EventCategory = "Fraud" | "Ops" | "Safety" | "Sales" | "Health";
export type EventSeverity = "Low" | "Medium" | "High";

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  severity: EventSeverity;
  createdAt: string; // ISO date string
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
}

// In-memory store
export const users: User[] = [
  { email: "admin@test.com", password: "password", role: "admin" },
  { email: "analyst@test.com", password: "password", role: "analyst" },
  { email: "viewer@test.com", password: "password", role: "viewer" },
];

export let events: Event[] = [];

const DATA_FILE = path.join(__dirname, "data.json");

// Helper to load events from JSON
export const loadEvents = (): boolean => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      events = JSON.parse(data);
      console.log(`Loaded ${events.length} events from disk.`);
      return true;
    }
  } catch (err) {
    console.error("Failed to load events from disk:", err);
  }
  return false;
};

// Helper to save events to JSON
const saveEvents = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(events, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save events to disk:", err);
  }
};

// Helper to reset/set events (for seeding)
export const setEvents = (newEvents: Event[]) => {
  events.length = 0; // Clear existing
  events.push(...newEvents);
  saveEvents(); // Persist immediately after seeding
};

// CRUD Helpers with persistence
export const addEvent = (event: Event) => {
  events.push(event);
  saveEvents();
};

export const updateEvent = (
  id: string,
  updates: Partial<Event>,
): Event | null => {
  const index = events.findIndex((e) => e.id === id);
  if (index === -1) return null;

  events[index] = { ...events[index], ...updates };
  saveEvents();
  return events[index];
};

export const deleteEvent = (id: string): boolean => {
  const index = events.findIndex((e) => e.id === id);
  if (index === -1) return false;

  events.splice(index, 1);
  saveEvents();
  return true;
};
