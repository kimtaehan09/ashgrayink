
'use client';

import { useState, useEffect } from 'react';
import { getFooterData, type FooterData } from './actions';
import FooterForm from './form';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare } from 'lucide-react';


const FooterFormSkeleton = () => (
    <div className="space-y-8">
        <div className="flex items-center gap-4 mb-4">
            <MessageSquare className="h-8 w-8 text-primary" />
            <div>
                <h1 className="text-2xl font-bold">Edit Footer Section</h1>
                <p className="text-muted-foreground">Update the content of your website footer.</p>
            </div>
        </div>
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
        <Skeleton className="h-10 w-36" />
    </div>
);


export default function FooterAdminPage() {
    const [footerData, setFooterData] = useState<FooterData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const data = await getFooterData();
                setFooterData(data);
            } catch (error) {
                console.error("Failed to load footer data", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading || !footerData) {
        return <FooterFormSkeleton />;
    }

    return (
        <div>
            <FooterForm initialData={footerData} />
        </div>
    );
}
