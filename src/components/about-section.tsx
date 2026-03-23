
import { type AboutSectionData } from '@/app/admin/(admin)/about/actions';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import Link from 'next/link';

interface AboutSectionProps {
  initialData: AboutSectionData;
}

export default function AboutSection({ initialData }: AboutSectionProps) {
  const { desktop, mobile, stats } = initialData;

  return (
    <div 
      id="about" 
      className="relative text-center bg-about-mobile-gray text-white py-[74px] md:bg-transparent md:text-foreground md:py-24"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid items-center gap-8 md:grid-cols-1 md:gap-12">
          <div className="space-y-6">
            <h2 className="font-bold font-headline text-3xl md:hidden">
              {mobile.title}
            </h2>
             <h2 className="hidden md:block font-bold font-headline text-5xl">
              {desktop.title}
            </h2>

            <div className="text-lg leading-relaxed mx-auto max-w-5xl whitespace-pre-wrap [text-shadow:0_1px_2px_rgba(0,0,0,0.5)] md:text-shadow-none">
              <p className="md:hidden">{mobile.description}</p>
              <p className="hidden md:block">{desktop.description}</p>
            </div>
          </div>
        </div>

        <div className="mt-12 md:hidden">
          <p className="text-lg mb-6 [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
            This is our story,<br />and we&apos;d love to be part of yours.
          </p>
          <Button variant="outline" asChild className="bg-artist-mobile-gray border-white text-black hover:bg-white hover:text-black px-8">
            <Link href="#contact">
              TELL US YOUR STORY
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
