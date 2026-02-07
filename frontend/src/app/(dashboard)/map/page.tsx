
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const EventMap = dynamic(() => import('@/components/EventMap'), {
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center bg-slate-100">Loading map...</div>
});

export default function MapPage() {
    const [category, setCategory] = useState<string>('all');
    const [severity, setSeverity] = useState<string>('all');
    const [minScore, setMinScore] = useState<number>(0);
    const [dateRange, setDateRange] = useState<string>('all');

    // Date logic
    const getDateFilter = () => {
        const now = new Date();
        if (dateRange === '7d') {
            const date = new Date(now.setDate(now.getDate() - 7));
            return date.toISOString();
        }
        if (dateRange === '30d') {
            const date = new Date(now.setDate(now.getDate() - 30));
            return date.toISOString();
        }
        return '';
    };

    const filters = {
        category,
        severity,
        minScore,
        startDate: getDateFilter(),
    };

    return (
        <div className="space-y-4 h-[calc(100vh-8rem)]">
            <div className="flex gap-4 flex-wrap bg-white p-4 rounded-lg border shadow-sm z-10 relative">
                <div className="grid w-[150px] items-center gap-1.5">
                    <span className="text-sm font-medium">Category</span>
                    <Select value={category} onValueChange={setCategory}>
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
                    <Select value={severity} onValueChange={setSeverity}>
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
                        onChange={(e) => setMinScore(Number(e.target.value))}
                    />
                </div>

                <div className="grid w-[150px] items-center gap-1.5">
                    <span className="text-sm font-medium">Date Range</span>
                    <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger><SelectValue placeholder="All Time" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="7d">Last 7 Days</SelectItem>
                            <SelectItem value="30d">Last 30 Days</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="h-full w-full rounded-lg overflow-hidden border">
                <EventMap filters={filters} />
            </div>
        </div>
    );
}
