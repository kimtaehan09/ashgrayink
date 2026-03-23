
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Instagram, Menu, X, Home, Users, GalleryHorizontal, Calendar, MapPin, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { getFooterData, type SocialLink } from '@/app/admin/(admin)/footer/actions';
import { Button } from './ui/button';

const socialIconMap = {
    instagram: Instagram,
    facebook: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 16 16"><path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-2.6 13.012h1.36L4.323 2.145H2.865l7.136 11.617Z"/></svg>,
    x: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 16 16"><path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-2.6 13.012h1.36L4.323 2.145H2.865l7.136 11.617Z"/></svg>,
    youtube: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 16 16"><path d="M8.051 1.999a.6.6 0 0 1 .59.022l4.994 2.88a.6.6 0 0 1 .305.518v5.15a.6.6 0 0 1-.305.518l-4.994 2.882a.6.6 0 0 1-.59.022a.6.6 0 0 1-.299-.518V2.517a.6.6 0 0 1 .3-.518Z"/></svg>,
};

export default function Header() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    async function fetchData() {
        try {
            const footerData = await getFooterData();
            setSocialLinks(footerData.socialLinks || []);
        } catch (error) {
            console.error("Failed to fetch social links", error);
            setSocialLinks([
                { platform: 'instagram', url: 'https://www.instagram.com/ashgray_ink/?hl=ko' },
                { platform: 'facebook', url: '#' }
            ]);
        }
    }
    fetchData();

    const handleScroll = () => {
        setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };

  }, []);

  const navLinks = [
      { id: 'home', label: 'HOME', desktopPadding: 0 },
      { id: 'about', label: 'ABOUT', desktopPadding: 256 },
      { id: 'artists', label: 'ARTISTS', desktopPadding: 256 },
      { id: 'gallery', label: 'GALLERY', desktopPadding: 140 },
      { id: 'contact', label: 'BOOK NOW', desktopPadding: 140 },
      { id: 'location', label: 'LOCATION', desktopPadding: 140 },
      { id: 'faq', label: 'FAQ', desktopPadding: 140 },
  ];

  const handleNavClick = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
        if (sectionId === 'home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            const headerHeight = 96; // h-24 = 96px
            const link = navLinks.find(l => l.id === sectionId);
            const currentDesktopPadding = link?.desktopPadding || 0;
            const targetPadding = 96; // 6rem

            const extraOffset = currentDesktopPadding > targetPadding 
                ? currentDesktopPadding - targetPadding 
                : 0;
            
            const elementPosition = section.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerHeight + extraOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }
  };

  const mobileNavLinks = [
      { id: 'home', label: 'HOME', icon: Home },
      { id: 'about', label: 'ABOUT', icon: Users },
      { id: 'artists', label: 'ARTISTS', icon: Users },
      { id: 'gallery', label: 'GALLERY', icon: GalleryHorizontal },
      { id: 'contact', label: 'BOOK NOW', icon: Calendar },
      { id: 'location', label: 'LOCATION', icon: MapPin },
      { id: 'faq', label: 'FAQ', icon: HelpCircle },
  ];

  return (
    <header className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        isScrolled 
            ? "bg-gradient-to-b from-gray-900/50 to-transparent backdrop-blur-sm" 
            : "bg-gradient-to-b from-gray-900/50 to-transparent"
    )}>
      <div className="mx-auto flex h-24 items-center justify-between px-6">
        <div className="flex-1 hidden md:flex justify-start">
          <a href="#home" onClick={(e) => handleNavClick(e, 'home')} className="hidden md:flex text-2xl font-bold font-copperplate text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
            ASH GRAY INK
          </a>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex-1 flex justify-start">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] bg-background text-foreground">
                    <div className="p-6">
                        <h2 className="text-2xl font-bold font-copperplate mb-8">ASH GRAY INK</h2>
                        <nav className="flex flex-col space-y-2">
                             {mobileNavLinks.map(link => (
                                <SheetClose asChild key={link.id}>
                                    <a
                                        href={`#${link.id}`}
                                        onClick={(e) => handleNavClick(e, link.id)}
                                        className="flex items-center gap-3 p-3 rounded-md hover:bg-muted text-lg"
                                    >
                                        <link.icon className="h-5 w-5" />
                                        {link.label}
                                    </a>
                                </SheetClose>
                            ))}
                        </nav>
                    </div>
                </SheetContent>
            </Sheet>
        </div>


        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 justify-center items-center space-x-8 text-lg font-medium">
          {navLinks.map(link => (
            <a 
                key={link.id} 
                href={`#${link.id}`}
                onClick={(e) => handleNavClick(e, link.id)}
                className="transition-colors text-white hover:text-opacity-80 whitespace-nowrap cursor-pointer [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex-1 flex justify-end items-center space-x-4">
          {socialLinks.map(link => {
            const Icon = socialIconMap[link.platform];
            if (!Icon || link.platform === 'facebook') return null;
            return (
                 <Link key={link.platform} href={link.url} aria-label={link.platform} className="hidden md:block" target="_blank" rel="noopener noreferrer">
                    <Icon className="h-6 w-6 text-white hover:text-opacity-80 transition-colors" />
                </Link>
            )
          })}
        </div>
      </div>
    </header>
  );
}
