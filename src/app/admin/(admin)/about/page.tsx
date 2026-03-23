
'use client';

import { useState, useEffect } from 'react';
import { getAboutData, type AboutSectionData } from './actions';
import AboutForm from './form';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit } from 'lucide-react';

const AboutFormSkeleton = () => (
    <div className="space-y-8">
        <div className="flex items-center gap-4 mb-8">
            <Edit className="h-8 w-8 text-primary" />
            <div>
                <h1 className="text-2xl font-bold">Edit About Section</h1>
                <p className="text-muted-foreground">Update the title, paragraphs, image, and stats in the 'Our Story' section.</p>
            </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
            <div>
                <Skeleton className="h-72 w-full" />
            </div>
        </div>
        <Skeleton className="h-10 w-32" />
    </div>
);


export default function AboutAdminPage() {
  const [aboutData, setAboutData] = useState<AboutSectionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getAboutData();
        setAboutData(data);
      } catch (error) {
        console.error('Failed to load about data', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !aboutData) {
    return <AboutFormSkeleton />;
  }

  return (
    <div>
      <AboutForm initialData={aboutData} />
    </div>
  );
}
