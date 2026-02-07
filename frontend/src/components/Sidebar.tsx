
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Map, List, Users, Info } from 'lucide-react';

export function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuth();

    const links = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/map', label: 'Map View', icon: Map },
        { href: '/events', label: 'Events', icon: List },
        ...(user?.role === 'admin' ? [{ href: '/admin', label: 'Admin', icon: Users }] : []),
        { href: '/about', label: 'About', icon: Info },
    ];

    return (
        <div className="flex flex-col h-full border-r bg-slate-900 text-slate-100 w-64">
            <div className="p-6 border-b border-slate-800">
                <h1 className="text-xl font-bold tracking-tight">InsightOps</h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                isActive
                                    ? "bg-indigo-600 text-white"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
                v1.0.0
            </div>
        </div>
    );
}
