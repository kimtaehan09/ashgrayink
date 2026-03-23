
'use client';

import { useState, useEffect } from 'react';
import { getFaqData, type FaqSectionData } from './actions';
import FaqForm from './form';
import { Skeleton } from '@/components/ui/skeleton';
import { HelpCircle } from 'lucide-react';


const FaqFormSkeleton = () => (
    <div className="space-y-8">
        <div className="flex items-center gap-4 mb-4">
            <HelpCircle className="h-8 w-8 text-primary" />
            <div>
                <h1 className="text-2xl font-bold">Edit FAQ Section</h1>
                <p className="text-muted-foreground">Update the title, subtitle, and all question/answer pairs.</p>
            </div>
        </div>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-10 w-36" />
    </div>
);


export default function FaqAdminPage() {
    const [faqData, setFaqData] = useState<FaqSectionData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const data = await getFaqData();
                setFaqData(data);
            } catch (error) {
                console.error("Failed to load FAQ data", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading || !faqData) {
        return <FaqFormSkeleton />;
    }

    return (
        <div>
            <FaqForm initialData={faqData} />
        </div>
    );
}
