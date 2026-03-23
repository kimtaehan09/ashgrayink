
'use client';

import { useState, useEffect } from 'react';
import { getArtistsData, getArtistContentData, type ArtistContentData } from './actions';
import ArtistsForm, { type Artist } from './form';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Loader2 } from 'lucide-react';


const ArtistsFormSkeleton = () => (
    <div className="space-y-8">
        <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
                <Users className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-2xl font-bold">Edit Artists Section</h1>
                    <p className="text-muted-foreground">Manage your studio's artists and section content.</p>
                </div>
            </div>
        </div>
        <Skeleton className="h-48 w-full" />
        <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-[500px] w-full" />
    </div>
);

export default function ArtistsAdminPage() {
    const [artistsData, setArtistsData] = useState<Artist[] | null>(null);
    const [contentData, setContentData] = useState<ArtistContentData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [artists, content] = await Promise.all([
                    getArtistsData(),
                    getArtistContentData()
                ]);
                setArtistsData(artists);
                setContentData(content);
            } catch (error) {
                console.error("Failed to load artists page data", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading || !artistsData || !contentData) {
        return <ArtistsFormSkeleton />;
    }

    return (
        <div>
            <ArtistsForm initialArtistsData={artistsData} initialContentData={contentData} />
        </div>
    );
}
