
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { type ArtistContentData } from '@/app/admin/(admin)/artists/actions';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { cn } from '@/lib/utils';

export interface Artist {
  id: string;
  name: string;
  styles: string;
  description: string;
  galleryUrl: string;
  image: {
    src: string;
    alt: string;
    hint: string;
  };
}

interface ArtistPortfolioProps {
    initialArtistsData: Artist[];
    initialContentData: ArtistContentData;
}

export default function ArtistPortfolio({ initialArtistsData, initialContentData }: ArtistPortfolioProps) {
  const { desktop, mobile } = initialContentData;

  const handleBookNowClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="artists" className="relative pb-16 pt-[74px] bg-artist-mobile-gray md:pb-24 md:pt-48 md:bg-desktop-section-gray">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl font-bold font-headline text-foreground md:hidden">{mobile.title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto md:hidden">
            {mobile.subtitle}
          </p>
          <h2 className="hidden md:block text-5xl font-bold font-headline text-foreground">{desktop.title}</h2>
          <p className="hidden md:block text-lg text-muted-foreground max-w-2xl mx-auto">
            {desktop.subtitle}
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent>
            {initialArtistsData.map((artist, index) => (
              <CarouselItem key={index} className="basis-4/5 sm:basis-1/2 lg:basis-1/4">
                <div className="p-1 h-full">
                  <div className="text-center group border rounded-lg p-4 h-full flex flex-col bg-card border-border">
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-4">
                      <Image
                        src={artist.image.src}
                        alt={artist.image.alt}
                        data-ai-hint={artist.image.hint}
                        fill
                        sizes="(max-width: 640px) 80vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-2 flex-grow">
                      <h3 className="text-xl font-headline tracking-wider text-card-foreground">{artist.name}</h3>
                      <p className="text-sm text-muted-foreground">{artist.styles}</p>
                      <p className="text-sm text-card-foreground px-2 whitespace-pre-wrap">{artist.description}</p>
                    </div>
                    <div className="mt-auto pt-4 space-y-2">
                      <Link 
                          href={artist.galleryUrl || '#'}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-block font-bold text-sm tracking-widest text-[#FAA938] hover:text-[#FAA938]/90 hover:underline"
                      >
                        VIEW GALLERY
                      </Link>
                      <div>
                      <Button variant="outline" asChild className="h-8 py-1 transition-transform duration-300 ease-in-out hover:scale-105 hover:bg-[#FAA938] hover:text-white hover:border-[#FAA938]">
                        <a href="#contact" onClick={handleBookNowClick}>Book Now</a>
                      </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
      <div className="hidden md:block absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-background to-transparent pointer-events-none"></div>
    </section>
  );
}
