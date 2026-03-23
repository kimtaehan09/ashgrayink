
'use client';

import { useState, useEffect } from 'react';
import { getAppointmentContentData, type AppointmentContentData } from './actions';
import AppointmentContentForm from './form';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from 'lucide-react';

const FormSkeleton = () => (
    <div className="space-y-8">
        <div className="flex items-center gap-4 mb-4">
            <Calendar className="h-8 w-8 text-primary" />
            <div>
                <h1 className="text-2xl font-bold">Edit Appointment Section Content</h1>
                <p className="text-muted-foreground">Update the title and subtitle for the appointment form section.</p>
            </div>
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-10 w-36" />
    </div>
);

export default function AppointmentContentAdminPage() {
    const [data, setData] = useState<AppointmentContentData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const result = await getAppointmentContentData();
                setData(result);
            } catch (error) {
                console.error("Failed to load appointment content data", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading || !data) {
        return <FormSkeleton />;
    }

    return (
        <div>
            <AppointmentContentForm initialData={data} />
        </div>
    );
}
