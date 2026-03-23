
'use client';

import { useState, useEffect } from 'react';
import { getGalleryData, type GalleryData } from './actions';
import GalleryForm from './form';
import { Skeleton } from '@/components/ui/skeleton';
import { GalleryHorizontal } from 'lucide-react';
import type { GalleryMediaItem } from './types';

const GalleryFormSkeleton = () => (
    <div className="space-y-8">
        <div className="flex items-center gap-4 mb-4">
            <GalleryHorizontal className="h-8 w-8 text-primary" />
            <div>
                <h1 className="text-2xl font-bold">Edit Gallery Section</h1>
                <p className="text-muted-foreground">Manage the content of the gallery.</p>
            </div>
        </div>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-10 w-36" />
    </div>
);


export default function GalleryAdminPage() {
    const [galleryData, setGalleryData] = useState<GalleryData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const data = await getGalleryData();
                const mainMediaWithPreview = data.mainMedia.map((item: GalleryMediaItem) => ({ ...item, preview: item.src }));
                const additionalMediaWithPreview = data.additionalMedia.map((item: GalleryMediaItem) => ({ ...item, preview: item.src }));
                
                setGalleryData({ 
                    ...data, 
                    mainMedia: mainMediaWithPreview,
                    additionalMedia: additionalMediaWithPreview 
                });
            } catch (error) {
                console.error("Failed to load gallery data", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading || !galleryData) {
        return <GalleryFormSkeleton />;
    }

    return (
        <div>
            <GalleryForm initialData={galleryData} />
        </div>
    );
}
