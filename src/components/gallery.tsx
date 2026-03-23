
'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { type GalleryData } from '@/app/admin/(admin)/gallery/actions';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { galleryCategories } from '@/app/admin/(admin)/gallery/types';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay";
import type { GalleryMediaItem } from '@/app/admin/(admin)/gallery/types';
import { cn } from '@/lib/utils';

interface GalleryProps {
  initialData: GalleryData;
}

const INITIAL_VISIBLE_COUNT = 9;

export default function Gallery({ initialData }: GalleryProps) {
  const [filter, setFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { textContent, mainMedia, additionalMedia } = initialData;
  
  const allMedia = useMemo(() => [...(mainMedia || []), ...(additionalMedia || [])], [mainMedia, additionalMedia]);

  const allCategories = useMemo(() => {
    return [{ value: 'all', label: 'ALL' }, ...galleryCategories];
  }, []);

  const filteredItems = useMemo(() => {
    if (filter === 'all') return allMedia;
    return allMedia.filter(item => item.category === filter);
  }, [allMedia, filter]);
  
  const blackAndGrayItems = useMemo(() => {
    return allMedia.filter(item => item.category === 'black-and-gray');
  }, [allMedia]);
  
  const colorItems = useMemo(() => {
      return allMedia.filter(item => item.category === 'color');
  }, [allMedia]);

  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, INITIAL_VISIBLE_COUNT);
  }, [filteredItems]);

  const totalFilteredCount = useMemo(() => {
    if (!allMedia) return 0;
    if (filter === 'all') return allMedia.length;
    return allMedia.filter(item => item.category === filter).length;
  }, [allMedia, filter]);

  const renderCarousel = (items: GalleryMediaItem[]) => (
    <div className="mb-8">
        <Carousel
            opts={{ align: "start", loop: true }}
            plugins={[Autoplay({ delay: 3000, stopOnInteraction: false })]}
            className="w-full"
        >
            <CarouselContent>
                {items.map((item) => (
                    <CarouselItem key={item.id} className="basis-4/5 sm:basis-1/2 lg:basis-1/3">
                        <div className="p-1">
                            <div className="relative group aspect-square overflow-hidden rounded-lg">
                                {item.type === 'image' ? (
                                    <Image
                                        src={item.src!}
                                        alt=""
                                        fill
                                        sizes="(max-width: 640px) 80vw, (max-width: 1024px) 50vw, 33vw"
                                        className="object-cover"
                                    />
                                ) : (
                                    <video
                                        key={item.src}
                                        src={item.src}
                                        controls={false}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="w-full h-full object-cover"
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                )}
                            </div>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
        </Carousel>
    </div>
  );

  return (
    <section id="gallery" className="relative py-20 pt-[74px] bg-background md:pt-[8.75rem] md:pb-48">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-4xl md:text-5xl font-bold font-headline text-foreground">{textContent?.title || 'GALLERY'}</h2>
          <p className="text-muted-foreground mt-4">
            {textContent?.subtitle || 'Explore our latest work.'}
          </p>
        </div>
        
        <div className="md:hidden space-y-8">
             <div className="flex justify-center flex-wrap gap-2">
                <Button variant={'outline'} asChild className={"hover:bg-[#FAA938] hover:text-white hover:border-[#FAA938]"}>
                    <Link href={`/gallery/black-and-gray`} target="_blank" rel="noopener noreferrer">
                        Black&Grey
                    </Link>
                </Button>
                <Button variant={'outline'} asChild className={"hover:bg-[#FAA938] hover:text-white hover:border-[#FAA938]"}>
                     <Link href={`/gallery/color`} target="_blank" rel="noopener noreferrer">
                        Colour
                    </Link>
                </Button>
            </div>
            {blackAndGrayItems.length > 0 && renderCarousel(blackAndGrayItems)}
            {colorItems.length > 0 && renderCarousel(colorItems)}
        </div>

        <div className="hidden md:block">
            <div className="flex justify-center flex-wrap gap-2 mb-8">
            {allCategories.map(cat => (
                <Button
                key={cat.value}
                variant={filter === cat.value ? 'outline' : 'outline'}
                onClick={() => setFilter(cat.value)}
                className={filter === cat.value ? "bg-[#FAA938] text-white border-[#FAA938]" : "hover:bg-[#FAA938] hover:text-white hover:border-[#FAA938]"}
                >
                {cat.label}
                </Button>
            ))}
            </div>
            <Dialog>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {visibleItems.map((item) => (
                    item.type === 'image' ? (
                        <DialogTrigger asChild key={item.id} onClick={() => setSelectedImage(item.src || null)}>
                        <div className="relative group aspect-square overflow-hidden cursor-pointer">
                            <Image
                            src={item.src!}
                            alt=""
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
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
            <DialogContent className="max-w-2xl p-0 border-0">
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
            {visibleItems.length > 0 && visibleItems.length < totalFilteredCount && (
            <div className="text-center mt-12">
                <Button variant="outline" asChild className="hover:bg-[#FAA938] hover:text-white hover:border-[#FAA938]">
                    <Link href={`/gallery/${filter}`} target="_blank">
                        View More
                    </Link>
                </Button>
            </div>
            )}
            {visibleItems.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-muted-foreground">No media found in this category.</p>
                </div>
            )}
        </div>
      </div>
      <div className="hidden md:block absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-appointment-mobile-gray to-transparent pointer-events-none"></div>
    </section>
  );
}
