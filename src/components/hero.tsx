
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Mouse, Loader2 } from 'lucide-react';
import { type HeroSectionData } from '@/app/admin/(admin)/hero/actions';
import Image from 'next/image';

interface HeroProps {
  initialData: HeroSectionData;
}

const BackgroundMedia = ({
  desktopType,
  mobileType,
  imageUrl,
  videoUrl,
  imageScale,
}: {
  desktopType: 'image' | 'video';
  mobileType: 'image' | 'video';
  imageUrl: string;
  videoUrl: string;
  imageScale: number;
}) => {
  return (
    <>
      {/* Mobile Background */}
      <div className="md:hidden absolute inset-0">
        {mobileType === 'video' && videoUrl ? (
          <video
            key={`mobile-${videoUrl}`}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <Image
            src={imageUrl}
            alt="Tattoo studio background"
            fill
            priority
            unoptimized={true}
            sizes="100vw"
            className="object-cover object-center"
            style={{ transform: `scale(${imageScale / 100})` }}
          />
        )}
      </div>
      {/* Desktop Background */}
      <div className="hidden md:block absolute inset-0">
        {desktopType === 'video' && videoUrl ? (
          <video
            key={`desktop-${videoUrl}`}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <Image
            src={imageUrl}
            alt="Tattoo studio background"
            fill
            priority
            unoptimized={true}
            sizes="100vw"
            className="object-cover object-center"
            style={{ transform: `scale(${imageScale / 100})` }}
          />
        )}
      </div>
    </>
  );
};


export default function Hero({ initialData }: HeroProps) {

  const handleNavClick = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      if (sectionId === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const {
    desktop,
    mobile,
    desktopBackgroundType,
    mobileBackgroundType,
    videoUrl,
    imageUrl,
    imageScale,
    logoUrl,
  } = initialData;

  const topShortcutLinks = [
    { id: 'artists', label: 'ARTISTS' },
    { id: 'gallery', label: 'GALLERY' },
    { id: 'location', label: 'LOCATION' },
  ];

  const bookNowLink = { id: 'contact', label: 'CREATE YOUR TATTOO' };

  return (
    <section id="home" className="relative w-full flex flex-col items-center justify-center text-center min-h-[100lvh] overflow-hidden">
      <BackgroundMedia 
        desktopType={desktopBackgroundType}
        mobileType={mobileBackgroundType}
        imageUrl={imageUrl}
        videoUrl={videoUrl}
        imageScale={imageScale}
      />
      <div className="absolute inset-0 bg-white/10"></div>

      <div className="relative container flex flex-col items-center px-4 md:px-6">

        <div className="flex flex-col items-center w-full md:w-full md:max-w-[1000px]">
          <div className="relative w-full aspect-[1000/384]">
            <Image
              src={logoUrl}
              alt="GA INK Logo"
              fill
              priority
              sizes="(max-width: 768px) 90vw, 1000px"
              className="object-contain"
            />
          </div>
        </div>

        <div className="relative flex flex-col items-center [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
            {/* Mobile Subtitle */}
            <p className="md:hidden text-2xl md:text-3xl font-light tracking-wide mt-[-2rem] md:mt-[-3rem] [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]">
                {mobile.subtitle}
            </p>
            {/* Desktop Subtitle */}
            <p className="hidden md:block text-2xl md:text-3xl font-light tracking-wide mt-[-2rem] md:mt-[-3rem] [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]">
                {desktop.subtitle}
            </p>
          
          <div className="md:hidden flex flex-col items-center w-full mt-4">
            <div className="flex flex-col w-full max-w-[310px] mx-auto">
              <div className="flex items-center justify-center gap-2.5 text-xs font-semibold text-white tracking-wider [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]">
                {topShortcutLinks.map((link) => (
                  <a
                    key={link.id}
                    href={`#${link.id}`}
                    onClick={(e) => handleNavClick(e, link.id)}
                    className="flex-1 text-center hover:text-opacity-80 transition-colors py-2 px-3 border border-white rounded-md"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <a
                href={`#${bookNowLink.id}`}
                onClick={(e) => handleNavClick(e, bookNowLink.id)}
                className="w-full block text-center transition-colors mt-6 py-3 px-3 border border-transparent rounded-md bg-white text-black text-xs font-semibold tracking-wider"
              >
                {bookNowLink.label}
              </a>
            </div>
          </div>

          <div className="hidden md:flex flex-col items-center space-y-4 pt-8">
            <Button size="lg" variant="outline" asChild className="bg-transparent border-white text-white hover:bg-white hover:text-black shadow-md">
              <Link href="#contact">
                {desktop.buttonText}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[104px] flex flex-col items-center space-y-2 animate-bounce text-white">
        <span className="text-sm tracking-widest [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">SCROLL DOWN</span>
        <Mouse className="h-6 w-6" />
      </div>
    </section>
  );
}
