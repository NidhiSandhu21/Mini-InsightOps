'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Search, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

import { EventFormDialog } from '@/components/EventFormDialog';
import { Event } from '@/types/event';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { X } from 'lucide-react';

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [category, setCategory] = useState<string>('all');
    const [severity, setSeverity] = useState<string>('all');
    const [minScore, setMinScore] = useState<number>(0);
    const [dateRange, setDateRange] = useState<string>('all');

    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const { user } = useAuth();

    const [limit, setLimit] = useState(10);

    const fetchEvents = useCallback(async (showLoader = true) => {
        if (showLoader) setLoading(true);
        // Add custom date logic later if needed, for now using preset ranges
        const getDateFilters = () => {
            const now = new Date();
            
            if (dateRange === '7d') {
                const start = new Date(now);
                start.setDate(now.getDate() - 7);
                start.setHours(0, 0, 0, 0);
                
                const end = new Date(now);
                end.setHours(23, 59, 59, 999);
                
                return { from: start.toISOString(), to: end.toISOString() };
            }
            if (dateRange === '30d') {
                const start = new Date(now);
                start.setDate(now.getDate() - 30);
                start.setHours(0, 0, 0, 0);
                
                const end = new Date(now);
                end.setHours(23, 59, 59, 999);
                
                return { from: start.toISOString(), to: end.toISOString() };
            }
            return { from: '', to: '' };
        };

        try {
            const { from: startDate, to: endDate } = getDateFilters();
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(activeSearch && { search: activeSearch }),
                ...(category !== 'all' && { category }),
                ...(severity !== 'all' && { severity }),
                ...(minScore > 0 && { minScore: minScore.toString() }),
                ...(startDate && { from: startDate }),
                ...(endDate && { to: endDate }),
            });
            const res = await api.get<{ events: Event[]; total: number }>('/events?' + params.toString());
            setEvents(res.events);
            setTotal(res.total);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, limit, activeSearch, category, severity, minScore, dateRange]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setActiveSearch(search);
        setPage(1);
    };

    const deleteEvent = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/events/${deleteId}`);
            setDeleteId(null);
            fetchEvents(false);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            alert('Failed to delete: ' + message);
        }
    };

    const totalPages = Math.ceil(total / limit);
    const showActions = user?.role === 'admin' || user?.role === 'analyst';
    const canCreate = showActions;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Events Log</h2>
                {canCreate && (
                    <EventFormDialog onSuccess={() => { setPage(1); fetchEvents(false); }} />
                )}
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-end bg-white p-4 rounded-lg border shadow-sm">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <span className="text-sm font-medium">Search</span>
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative flex-1">
                            <Input
                                placeholder="Search title or tags..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pr-8"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => { setSearch(''); setActiveSearch(''); setPage(1); }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <Button type="submit" variant="secondary"><Search className="w-4 h-4" /></Button>
                    </form>
                </div>

                <div className="flex gap-4 flex-wrap">
                    <div className="grid w-[150px] items-center gap-1.5">
                        <span className="text-sm font-medium">Category</span>
                        <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
                            <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="Fraud">Fraud</SelectItem>
                                <SelectItem value="Ops">Ops</SelectItem>
                                <SelectItem value="Safety">Safety</SelectItem>
                                <SelectItem value="Sales">Sales</SelectItem>
                                <SelectItem value="Health">Health</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid w-[150px] items-center gap-1.5">
                        <span className="text-sm font-medium">Severity</span>
                        <Select value={severity} onValueChange={(v) => { setSeverity(v); setPage(1); }}>
                            <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Severities</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="Low">Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid w-[120px] items-center gap-1.5">
                        <span className="text-sm font-medium">Min Score</span>
                        <Input
                            type="number"
                            min="0"
                            max="100"
                            value={minScore}
                            onChange={(e) => { setMinScore(Number(e.target.value)); setPage(1); }}
                        />
                    </div>

                    <div className="grid w-[150px] items-center gap-1.5">
                        <span className="text-sm font-medium">Date Range</span>
                        <Select value={dateRange} onValueChange={(v) => { setDateRange(v); setPage(1); }}>
                            <SelectTrigger><SelectValue placeholder="All Time" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Time</SelectItem>
                                <SelectItem value="7d">Last 7 Days</SelectItem>
                                <SelectItem value="30d">Last 30 Days</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Severity</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Created At</TableHead>
                            {showActions && <TableHead className="text-right">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={showActions ? 6 : 5} className="h-24 text-center">Loading...</TableCell>
                            </TableRow>
                        ) : events.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={showActions ? 6 : 5} className="h-24 text-center">No events found.</TableCell>
                            </TableRow>
                        ) : (
                            events.map((event) => (
                                <TableRow key={event.id}>
                                    <TableCell className="font-medium">
                                        <div>{event.title}</div>
                                        <div className="text-xs text-muted-foreground">{event.tags.join(', ')}</div>
                                    </TableCell>
                                    <TableCell>{event.category}</TableCell>
                                    <TableCell>
                                        <Badge className={`${event.severity === 'High' ? 'bg-red-500 hover:bg-red-600' :
                                            event.severity === 'Medium' ? 'bg-amber-500 hover:bg-amber-600' :
                                                'bg-emerald-500 hover:bg-emerald-600'
                                            } text-white`}>
                                            {event.severity}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{event.metrics.score}</TableCell>
                                    <TableCell>{new Date(event.createdAt).toLocaleDateString()}</TableCell>
                                    {showActions && (
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {canCreate && (
                                                    <EventFormDialog
                                                        onSuccess={() => fetchEvents(false)}
                                                        eventToEdit={event}
                                                        trigger={
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        }
                                                    />
                                                )}
                                                {user?.role === 'admin' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => setDeleteId(event.id)}
                                                    >
                                                        <span className="sr-only">Delete</span>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} results
                </div>
                <div className="flex items-center space-x-6 lg:space-x-8">
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">Rows per page</p>
                        <Select
                            value={`${limit}`}
                            onValueChange={(value) => {
                                setLimit(Number(value));
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue placeholder={limit} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 20, 30, 40, 50, 100, 200, 250].map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                        Page {page} of {totalPages}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || loading}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || loading}
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this event? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={deleteEvent}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
