
'use client';

import { useState, useEffect } from 'react';
import { getThemeData, type ThemeSectionData } from './actions';
import ThemeForm from './form';
import { Skeleton } from '@/components/ui/skeleton';
import { Palette } from 'lucide-react';


const ThemeFormSkeleton = () => (
    <div className="space-y-8">
        <div className="flex items-center gap-4 mb-4">
            <Palette className="h-8 w-8 text-primary" />
            <div>
                <h1 className="text-2xl font-bold">Edit Theme</h1>
                <p className="text-muted-foreground">Customize your website's colors and fonts.</p>
            </div>
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-36" />
    </div>
);


export default function ThemeAdminPage() {
    const [themeData, setThemeData] = useState<ThemeSectionData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const data = await getThemeData();
                setThemeData(data);
            } catch (error) {
                console.error("Failed to load theme data", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading || !themeData) {
        return <ThemeFormSkeleton />;
    }

    return (
        <div>
            <ThemeForm initialData={themeData} />
        </div>
    );
}
