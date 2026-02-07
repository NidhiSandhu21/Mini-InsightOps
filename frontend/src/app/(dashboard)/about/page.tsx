
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AboutPage() {
    return (
        <div className="space-y-6 max-w-4xl">
            <h2 className="text-3xl font-bold tracking-tight">About Mini InsightOps</h2>

            <Card>
                <CardHeader>
                    <CardTitle>Project Architecture</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Design Philosophy</h3>
                        <p className="text-muted-foreground">
                            Built with a strong focus on <strong>clean structure, type safety, and proper role-based security.</strong> 
                            AI tools were used only to speed up routine tasks like scaffolding and seed data generation, allowing the 
                            majority of development time to be spent on core architecture, security enforcement, and user experience.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-lg border">
                            <h4 className="font-medium mb-1 text-slate-900">Backend Engineering</h4>
                            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                <li><strong>Security:</strong> Implemented server-side middleware (authMiddleware, requireRole) to enforce RBAC at the API level.</li>
                                <li><strong>Persistence:</strong> Built a lightweight JSON-based persistence layer to maintain data across server restarts.</li>
                                <li><strong>Rate Limiting:</strong> Secured public-facing endpoints using express-rate-limit.</li>
                                <li><strong>Business Logic:</strong> Implemented complex filtering logic for dashboard queries.</li>
                            </ul>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg border">
                            <h4 className="font-medium mb-1 text-slate-900">Frontend Excellence</h4>
                            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                <li><strong>SSR Handling:</strong> Refactored map components to correctly handle SSR constraints and fix Leaflet window issues.</li>
                                <li><strong>Type Safety:</strong> Defined explicit TypeScript interfaces for all domain models and API responses.</li>
                                <li><strong>Responsive UI:</strong> Built with Next.js 14 App Router and Shadcn UI for a modern, accessible experience.</li>
                                <li><strong>Real-time Analytics:</strong> Integrated Recharts for instant data visualization.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <h3 className="text-lg font-semibold mb-3">Core Technology Stack</h3>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">Next.js 14</Badge>
                            <Badge variant="secondary">TypeScript</Badge>
                            <Badge variant="secondary">Tailwind CSS</Badge>
                            <Badge variant="secondary">Express.js</Badge>
                            <Badge variant="secondary">Leaflet</Badge>
                            <Badge variant="secondary">Recharts</Badge>
                            <Badge variant="secondary">Zod</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
