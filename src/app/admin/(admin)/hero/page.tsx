
'use client';

import { useState, useEffect } from 'react';
import { getHeroData, type HeroSectionData } from './actions';
import HeroForm from './form';
import { Skeleton } from '@/components/ui/skeleton';
import { Home } from 'lucide-react';

const HeroFormSkeleton = () => (
    <div className="space-y-8">
        <div className="flex items-center gap-4 mb-8">
            <Home className="h-8 w-8 text-primary" />
            <div>
                <h1 className="text-2xl font-bold">Edit Hero Section</h1>
                <p className="text-muted-foreground">Update the content, logo, and background for the hero section.</p>
            </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-96 w-full" />
            </div>
            <div className="space-y-8">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
        <Skeleton className="h-10 w-32" />
    </div>
);


export default function HeroAdminPage() {
    const [heroData, setHeroData] = useState<HeroSectionData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const data = await getHeroData();
                setHeroData(data);
            } catch (error) {
                console.error("Failed to load hero data", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading || !heroData) {
        return <HeroFormSkeleton />;
    }

    return (
        <div>
            <HeroForm initialData={heroData} />
        </div>
    );
}
