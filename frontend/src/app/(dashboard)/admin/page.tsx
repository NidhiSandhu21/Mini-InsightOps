
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
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
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface UserData {
    email: string;
    role: 'admin' | 'analyst' | 'viewer';
}

export default function AdminPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user && user.role !== 'admin') {
            router.push('/dashboard');
            return;
        }

        const fetchUsers = async () => {
            try {
                const data = await api.get<UserData[]>('/users');
                setUsers(data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchUsers();
    }, [user, router]);

    const handleRoleChange = async (email: string, newRole: string) => {
        try {
            await api.put(`/users/${email}/role`, { role: newRole });
            setUsers(users.map(u => u.email === email ? { ...u, role: newRole as 'admin' | 'analyst' | 'viewer' } : u));
            toast.success(`Role updated to ${newRole} for ${email}`);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            toast.error('Failed to update role: ' + message);
        }
    };

    if (user?.role !== 'admin') return <div className="p-8">Unauthorized</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
            <div className="rounded-md border bg-white max-w-4xl">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead className="w-[200px]">Role</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((u) => (
                            <TableRow key={u.email}>
                                <TableCell className="font-medium">{u.email}</TableCell>
                                <TableCell>
                                    <Select
                                        value={u.role}
                                        onValueChange={(val) => handleRoleChange(u.email, val)}
                                        disabled={u.email === user.email} // Prevent changing own role effectively locking self out
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="analyst">Analyst</SelectItem>
                                            <SelectItem value="viewer">Viewer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
