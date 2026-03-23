
'use client';

import { useState, useEffect } from 'react';
import { getPrivacyPolicyData, type PrivacyPolicyData } from '@/app/admin/(admin)/privacy-policy/actions';
import { Skeleton } from '@/components/ui/skeleton';

const PrivacyPolicySkeleton = () => (
    <div className="prose max-w-none">
        <Skeleton className="h-10 w-1/2 mb-8" />
        <Skeleton className="h-4 w-full mb-4" />
        <Skeleton className="h-4 w-5/6 mb-4" />
        <Skeleton className="h-8 w-1/3 mt-8 mb-4" />
        <Skeleton className="h-4 w-full mb-4" />
        <Skeleton className="h-4 w-full mb-4" />
        <Skeleton className="h-4 w-4/6 mb-4" />
    </div>
);

export default function PrivacyPolicyPage() {
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
        return <PrivacyPolicySkeleton />;
    }

    return (
      <article className="prose max-w-none">
        <h1 className="text-4xl font-bold mb-8">{data.title}</h1>
        <div className="whitespace-pre-wrap">{data.content}</div>
      </article>
    );
}
