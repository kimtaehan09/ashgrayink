
'use client';

import { useState, useEffect } from 'react';
import { getLocationData, type LocationSectionData } from './actions';
import LocationForm from './form';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin } from 'lucide-react';


const LocationFormSkeleton = () => (
    <div className="space-y-8">
        <div className="flex items-center gap-4 mb-4">
            <MapPin className="h-8 w-8 text-primary" />
            <div>
                <h1 className="text-2xl font-bold">Edit Location Section</h1>
                <p className="text-muted-foreground">Update the content for the "Visit Our Studio" section.</p>
            </div>
        </div>
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-10 w-36" />
    </div>
);

export default function LocationAdminPage() {
    const [locationData, setLocationData] = useState<LocationSectionData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const data = await getLocationData();
                setLocationData(data);
            } catch (error) {
                console.error("Failed to load location data", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading || !locationData) {
        return <LocationFormSkeleton />;
    }

    return (
        <div>
            <LocationForm initialData={locationData} />
        </div>
    );
}
