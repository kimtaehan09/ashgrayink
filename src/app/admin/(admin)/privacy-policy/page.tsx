
'use client';

import { useState, useEffect } from 'react';
import { getPrivacyPolicyData, type PrivacyPolicyData } from './actions';
import PrivacyPolicyForm from './form';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield } from 'lucide-react';

const FormSkeleton = () => (
    <div className="space-y-8">
        <div className="flex items-center gap-4 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <div>
                <h1 className="text-2xl font-bold">Edit Privacy Policy</h1>
                <p className="text-muted-foreground">Update the content for the privacy policy page.</p>
            </div>
        </div>
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-10 w-36" />
    </div>
);

export default function PrivacyPolicyAdminPage() {
    const [data, setData] = useState<PrivacyPolicyData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const result = await getPrivacyPolicyData();
                setData(result);
            } catch (error) {
                console.error("Failed to load privacy policy data", error);
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
            <PrivacyPolicyForm initialData={data} />
        </div>
    );
}
