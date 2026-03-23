
'use client';

import { useState, useEffect, useMemo, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getGalleryData, type GalleryData } from '@/app/admin/(admin)/gallery/actions';
import { getFooterData } from '@/app/admin/(admin)/footer/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import Footer from '@/components/footer';
import { ArrowLeft } from 'lucide-react';
import type { GalleryMediaItem } from '@/app/admin/(admin)/gallery/types';
import { galleryCategories } from '@/app/admin/(admin)/gallery/types';
import { notFound } from 'next/navigation';

const GalleryPageSkeleton = () => (
  <div className="bg-background">
    <main className="py-32 md:py-40">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center mb-12">
            <Skeleton className="h-12 w-1/3" />
            <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(12)].map((_, i) => <Skeleton key={i} className="aspect-square w-full" />)}
        </div>
      </div>
    </main>
  </div>
);

export default function GalleryCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = use(params);
  const [galleryData, setGalleryData] = useState<GalleryData | null>(null);
  const [footerData, setFooterData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const isValidCategory = useMemo(() => {
    if (category === 'all') return true;
    return galleryCategories.some(c => c.value === category);
  }, [category]);

  useEffect(() => {
    if (!isValidCategory) {
      notFound();
    }

    async function fetchData() {
        try {
            const [gData, fData] = await Promise.all([
                getGalleryData(),
                getFooterData(),
            ]);
            setGalleryData(gData);
            setFooterData(fData);
        } catch (error) {
            console.error("Failed to fetch page data:", error);
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, [isValidCategory]);
  
  const categoryLabel = useMemo(() => {
      if (category === 'all') return 'ALL';
      return galleryCategories.find(c => c.value === category)?.label || category.toUpperCase();
  }, [category]);

  const filteredItems = useMemo(() => {
    if (!galleryData) return [];
    const allItems = [...(galleryData.mainMedia || []), ...(galleryData.additionalMedia || [])];
    if (category === 'all') {
      return allItems;
    }
    return allItems.filter(item => item.category === category);
  }, [galleryData, category]);

  if (!isValidCategory) {
    return null; // notFound() is called in useEffect, this is a fallback.
  }
  
  if (loading) {
    return <GalleryPageSkeleton />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow py-32 md:py-40">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold font-headline text-foreground">
              Gallery: {categoryLabel}
            </h1>
            <Button variant="outline" asChild>
                <Link href="/#gallery">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Main
                </Link>
            </Button>
          </div>
          <Dialog>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredItems.map((item) => (
                item.type === 'image' ? (
                    <DialogTrigger asChild key={item.id} onClick={() => setSelectedImage(item.src)}>
                    <div className="relative group aspect-square overflow-hidden cursor-pointer">
                        <Image
                        src={item.src}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover rounded-lg transition-transform duration-300 ease-in-out group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    </DialogTrigger>
                ) : (
                    <div key={item.id} className="relative group aspect-square overflow-hidden cursor-pointer rounded-lg border bg-black">
                        <video
                            key={item.src}
                            src={item.src}
                            controls
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                )
              ))}
            </div>
            <DialogContent className="max-w-2xl p-0">
               <DialogTitle className="sr-only">Enlarged Gallery Image</DialogTitle>
               {selectedImage && (
                   <div>
                      <Image
                          src={selectedImage}
                          alt="Selected gallery image"
                          width={1024}
                          height={1024}
                          className="w-full h-auto object-contain rounded-md"
                      />
                   </div>
              )}
            </DialogContent>
          </Dialog>
           {filteredItems.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-muted-foreground">No items found in this category.</p>
                </div>
           )}
        </div>
      </main>
      {footerData && <Footer initialData={footerData} />}
    </div>
  );
}
