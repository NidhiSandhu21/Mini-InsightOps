
'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { api } from '@/lib/api';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';

// Dynamically import Leaflet components to avoid SSR window errors
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
// const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false }); // Unused

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Event } from '@/types/event';

// Fix for default markers
// const icon = L.icon({ ... }); // Unused

const createCustomIcon = (color: string) => L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

interface EventMapProps {
    filters?: {
        category: string;
        severity: string;
        minScore: number;
        startDate: string;
    };
}

export default function EventMap({ filters }: EventMapProps) {
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    useEffect(() => {
        // Check if we are checking headless in CI, map might fail if no window.
        if (typeof window === 'undefined') return;

        const params = new URLSearchParams({
            limit: '100',
            ...(filters?.category && filters.category !== 'all' ? { category: filters.category } : {}),
            ...(filters?.severity && filters.severity !== 'all' ? { severity: filters.severity } : {}),
            ...(filters?.minScore && filters.minScore > 0 ? { minScore: filters.minScore.toString() } : {}),
            ...(filters?.startDate ? { from: filters.startDate } : {}),
        });

        api.get<{ events: Event[] }>('/events?' + params.toString()).then((res) => {
            setEvents(res.events);
        });
    }, [filters]);

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'High': return '#ef4444'; // red-500
            case 'Medium': return '#f59e0b'; // amber-500
            case 'Low': return '#10b981'; // emerald-500
            default: return '#3b82f6';
        }
    };

    return (
        <div className="h-full w-full relative z-0">
            <MapContainer
                center={[20.5937, 78.9629]}
                zoom={5}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {events.map((event) => (
                    <Marker
                        key={event.id}
                        position={[event.location.lat, event.location.lng]}
                        icon={createCustomIcon(getSeverityColor(event.severity))}
                        eventHandlers={{
                            click: () => setSelectedEvent(event),
                        }}
                    >
                        {/* Popup removed as we use Sheet */}
                    </Marker>
                ))}
            </MapContainer>

            <Sheet open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
                <SheetContent className="pl-5">
                    {selectedEvent && (
                        <>
                            <SheetHeader>
                                <SheetTitle>{selectedEvent.title}</SheetTitle>
                                <SheetDescription>{new Date(selectedEvent.createdAt).toLocaleString()}</SheetDescription>
                            </SheetHeader>
                            <div className="mt-6 space-y-4">
                                <div className="flex gap-2">
                                    <Badge variant={selectedEvent.severity === 'High' ? 'destructive' : 'default'}>
                                        {selectedEvent.severity}
                                    </Badge>
                                    <Badge variant="outline">{selectedEvent.category}</Badge>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium mb-1">Description</h4>
                                    <p className="text-sm text-gray-600">{selectedEvent.description}</p>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium mb-1">Metrics</h4>
                                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                        <div className="bg-slate-100 p-2 rounded">
                                            <div className="font-bold">{selectedEvent.metrics.score}</div>
                                            <div className="text-xs text-gray-500">Score</div>
                                        </div>
                                        <div className="bg-slate-100 p-2 rounded">
                                            <div className="font-bold">{selectedEvent.metrics.impact}</div>
                                            <div className="text-xs text-gray-500">Impact</div>
                                        </div>
                                        <div className="bg-slate-100 p-2 rounded">
                                            <div className="font-bold">{selectedEvent.metrics.confidence}</div>
                                            <div className="text-xs text-gray-500">Conf</div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium mb-1">Tags</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {selectedEvent.tags.map((tag: string) => (
                                            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
