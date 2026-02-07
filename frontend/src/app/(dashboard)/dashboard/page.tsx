
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import { TrendingUp, AlertTriangle, Activity } from 'lucide-react';
import { Event } from '@/types/event';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const SEVERITY_COLORS = {
    High: '#ef4444',
    Medium: '#f59e0b',
    Low: '#10b981',
};

export default function DashboardPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get<{ events: Event[] }>('/events?limit=1000').then((res) => {
            setEvents(res.events);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="p-8">Loading dashboard metrics...</div>;

    // Compute metrics
    const totalEvents = events.length;
    // const highSeverityCount = events.filter(e => e.severity === 'High').length; // Unused
    const avgScore = totalEvents > 0 ? (events.reduce((acc, e) => acc + e.metrics.score, 0) / totalEvents).toFixed(1) : 0;

    // Chart Data: Categories
    const categoryCounts = events.reduce((acc: Record<string, number>, e: Event) => {
        acc[e.category] = (acc[e.category] || 0) + 1;
        return acc;
    }, {});
    const categoryData = Object.keys(categoryCounts).map(key => ({ name: key, count: categoryCounts[key] }));

    // Chart Data: Severities
    const severityCounts = events.reduce((acc: Record<string, number>, e: Event) => {
        acc[e.severity] = (acc[e.severity] || 0) + 1;
        return acc;
    }, {});
    // Chart Data: Severity Wrapper
    const severityData = Object.keys(severityCounts).map(key => ({ name: key, value: severityCounts[key] }));

    // Chart Data: Trend (mocked logic or real date)
    // Group by date (simplified date string)
    const trendCounts = events.reduce((acc: Record<string, number>, e: Event) => {
        const date = new Date(e.createdAt).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});
    // Sort by date logic (simplified by just keys sort or proper date sort)
    const trendData = Object.keys(trendCounts).map(date => ({ date, count: trendCounts[date] })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-7); // Last 7 days present

    // Insights Calculations
    // 1. % change in High severity events (last 7 days vs previous 7 days)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const highEventsLast7 = events.filter(e =>
        e.severity === 'High' &&
        new Date(e.createdAt) >= sevenDaysAgo
    ).length;

    const highEventsPrev7 = events.filter(e =>
        e.severity === 'High' &&
        new Date(e.createdAt) >= fourteenDaysAgo &&
        new Date(e.createdAt) < sevenDaysAgo
    ).length;

    let highSeverityChange = 0;
    if (highEventsPrev7 === 0) {
        highSeverityChange = highEventsLast7 > 0 ? 100 : 0;
    } else {
        highSeverityChange = Math.round(((highEventsLast7 - highEventsPrev7) / highEventsPrev7) * 100);
    }
    const trendDirection = highSeverityChange > 0 ? 'up' : 'down';

    // 2. Top category this week
    const recentEvents = events.filter(e => new Date(e.createdAt) >= sevenDaysAgo);
    const recentCatCounts = recentEvents.reduce((acc: Record<string, number>, e: Event) => {
        acc[e.category] = (acc[e.category] || 0) + 1;
        return acc;
    }, {});
    const topCategory = Object.keys(recentCatCounts).length > 0
        ? Object.keys(recentCatCounts).reduce((a, b) => recentCatCounts[a] > recentCatCounts[b] ? a : b)
        : 'N/A';
    const topCategoryCount = recentCatCounts[topCategory] || 0;

    // 3. Highest impact event
    const highestImpactEvent = events.length > 0
        ? events.reduce((prev, current) => (prev.metrics.impact > current.metrics.impact) ? prev : current)
        : null;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalEvents}</div>
                        <p className="text-xs text-muted-foreground">Active in database</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">High Severity</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-600">{highEventsLast7}</div>
                        <p className="text-xs text-muted-foreground">Last 7 days</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Risk Score</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{avgScore}</div>
                        <p className="text-xs text-muted-foreground">Out of 100</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

                {/* Main Activity Chart */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Event Activity</CardTitle>
                        <CardDescription>Recent volume per day</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <RechartsTooltip />
                                    <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Insights Section */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Key Insights</CardTitle>
                        <CardDescription>Automated analysis for this week</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-2 p-3 bg-slate-50 rounded-lg">
                                <TrendingUp className={`h-5 w-5 mt-0.5 ${trendDirection === 'up' ? 'text-red-500' : 'text-green-500'}`} />
                                <div>
                                    <p className="text-sm font-medium">High Severity Trend</p>
                                    <p className="text-sm text-muted-foreground">
                                        <span className={trendDirection === 'up' ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                                            {highSeverityChange > 0 ? '+' : ''}{highSeverityChange}%
                                        </span> change vs previous 7 days.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-2 p-3 bg-slate-50 rounded-lg">
                                <Activity className="h-5 w-5 mt-0.5 text-blue-500" />
                                <div>
                                    <p className="text-sm font-medium">Top Category</p>
                                    <p className="text-sm text-muted-foreground">
                                        <strong>{topCategory}</strong> is the most active category ({topCategoryCount} events).
                                    </p>
                                </div>
                            </div>

                            {highestImpactEvent && (
                                <div className="flex items-start space-x-2 p-3 bg-slate-50 rounded-lg">
                                    <AlertTriangle className="h-5 w-5 mt-0.5 text-orange-500" />
                                    <div>
                                        <p className="text-sm font-medium">Highest Impact</p>
                                        <p className="text-sm text-muted-foreground">
                                            &quot;{highestImpactEvent.title}&quot; (Impact: {highestImpactEvent.metrics.impact})
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Severity Breakdown */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Events by Severity</CardTitle>
                        <CardDescription>Risk distribution</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={severityData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {severityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.name as keyof typeof SEVERITY_COLORS] || '#8884d8'} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-4 mt-2">
                            {severityData.map((entry) => (
                                <div key={entry.name} className="flex items-center gap-2 text-sm">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SEVERITY_COLORS[entry.name as keyof typeof SEVERITY_COLORS] || '#8884d8' }} />
                                    <span>{entry.name} ({entry.value})</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Category Breakdown */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>By Category</CardTitle>
                        <CardDescription>Distribution of event types</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                                    <RechartsTooltip />
                                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}
