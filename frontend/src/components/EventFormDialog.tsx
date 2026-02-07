// ... imports ...
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { Event } from '@/types/event';

const eventSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    category: z.enum(['Fraud', 'Ops', 'Safety', 'Sales', 'Health']),
    severity: z.enum(['Low', 'Medium', 'High']),
    location: z.object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
    }),
    metrics: z.object({
        score: z.number().min(0).max(100),
        confidence: z.number().min(0).max(1),
        impact: z.number().min(0).max(10),
    }),
    tags: z.string(), // Keep as string for form, split on submit
});

type EventFormValues = z.infer<typeof eventSchema>;

interface EventFormDialogProps {
    onSuccess: () => void;
    eventToEdit?: Event; // If provided, we are in Edit mode
    trigger?: React.ReactNode; // Custom trigger button
}

export function EventFormDialog({ onSuccess, eventToEdit, trigger }: EventFormDialogProps) {
    const [open, setOpen] = useState(false);

    const form = useForm<EventFormValues>({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            title: '',
            description: '',
            category: 'Ops',
            severity: 'Medium',
            location: { lat: 0, lng: 0 },
            metrics: { score: 50, confidence: 0.5, impact: 5 },
            tags: '',
        },
    });

    // Reset form when opening or when eventToEdit changes
    useEffect(() => {
        if (open) {
            if (eventToEdit) {
                form.reset({
                    title: eventToEdit.title,
                    description: eventToEdit.description,
                    category: eventToEdit.category,
                    severity: eventToEdit.severity,
                    location: eventToEdit.location,
                    metrics: eventToEdit.metrics,
                    tags: Array.isArray(eventToEdit.tags) ? eventToEdit.tags.join(', ') : eventToEdit.tags,
                });
            } else {
                form.reset({
                    title: '',
                    description: '',
                    category: 'Ops',
                    severity: 'Medium',
                    location: { lat: 0, lng: 0 },
                    metrics: { score: 50, confidence: 0.5, impact: 5 },
                    tags: '',
                });
            }
        }
    }, [open, eventToEdit, form]);

    const onSubmit = async (data: EventFormValues) => {
        try {
            // Transform tags string to array for API
            const payload = {
                ...data,
                tags: data.tags.split(',').map(s => s.trim()).filter(s => s)
            };

            if (eventToEdit) {
                await api.put(`/events/${eventToEdit.id}`, payload); // Assuming PUT /events/:id exists and works
            } else {
                await api.post('/events', payload);
            }

            setOpen(false);
            form.reset();
            onSuccess();
        } catch (error) {
            console.error('Failed to save event:', error);
        }
    };

    const isEdit = !!eventToEdit;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ? trigger : (
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Event
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Event' : 'Create New Event'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Update the event details.' : 'Fill in the details to log a new system event.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Event title" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Brief description" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {['Fraud', 'Ops', 'Safety', 'Sales', 'Health'].map(c => (
                                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="severity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Severity</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select severity" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {['Low', 'Medium', 'High'].map(s => (
                                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="location.lat"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Latitude</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="any"
                                                {...field}
                                                onChange={e => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="location.lng"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Longitude</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="any"
                                                {...field}
                                                onChange={e => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <FormField
                                control={form.control}
                                name="metrics.score"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Score (0-100)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={e => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="metrics.confidence"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confidence (0-1)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                {...field}
                                                onChange={e => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="metrics.impact"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Impact (0-10)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={e => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="tags"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tags (Comma separated)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="tag1, tag2, tag3" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Saving...' : (isEdit ? 'Update Event' : 'Create Event')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
