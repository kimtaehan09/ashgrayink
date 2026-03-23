
'use client';

import { useState, useEffect } from 'react';
import { getChatbotKnowledgeData } from './actions';
import KnowledgeForm from './form';
import { Skeleton } from '@/components/ui/skeleton';
import { BrainCircuit } from 'lucide-react';
import type { KnowledgeItem } from './types';


const KnowledgeFormSkeleton = () => (
    <div className="space-y-8">
        <div className="flex items-center gap-4 mb-4">
            <BrainCircuit className="h-8 w-8 text-primary" />
            <div>
                <h1 className="text-2xl font-bold">Edit Chatbot Knowledge</h1>
                <p className="text-muted-foreground">Add, edit, or remove questions and answers to train your chatbot.</p>
            </div>
        </div>
        <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-10 w-48" />
        </div>
         <Skeleton className="h-10 w-48" />
    </div>
);


export default function ChatbotKnowledgeAdminPage() {
    const [knowledgeData, setKnowledgeData] = useState<KnowledgeItem[] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const data = await getChatbotKnowledgeData();
                setKnowledgeData(data);
            } catch (error) {
                console.error("Failed to load chatbot knowledge data", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading || !knowledgeData) {
        return <KnowledgeFormSkeleton />;
    }

    return (
        <div>
            <KnowledgeForm initialData={knowledgeData} />
        </div>
    );
}
