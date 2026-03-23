
'use client';

import Link from 'next/link';
import { ArrowUp } from 'lucide-react';
import { type FooterData } from '@/app/admin/(admin)/footer/actions';

interface FooterProps {
    initialData: FooterData;
}

export default function Footer({ initialData }: FooterProps) {
    const scrollToTop = () => {
        if (typeof window !== 'undefined') {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };

    const content = initialData.desktop; // Default to desktop, as content is same
    const links = initialData.links || [];
    
    if (!content) {
        return null;
    }

    const handleScrollClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        scrollToTop();
    };

    return (
        <footer className="bg-appointment-mobile-gray text-muted-foreground border-t border-border font-body">
            <div className="container mx-auto px-4 md:px-6 py-6 space-y-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
                    <div className="text-center md:text-left">
                        <p>{content.copyrightText}</p>
                    </div>
                    <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                        {links.map((link, index) => (
                             <Link key={index} href={link.url} className="inline-block transition-transform duration-200 ease-in-out hover:scale-105">{link.label}</Link>
                        ))}
                    </nav>
                    <div className="text-center md:text-right">
                         <button onClick={handleScrollClick} className="inline-block transition-transform duration-200 ease-in-out hover:scale-105">
                            <span className="flex items-center gap-1">
                                Back to Top <ArrowUp className="h-4 w-4" />
                            </span>
                         </button>
                    </div>
                </div>

                <div className="border-t border-border/50"></div>

                <div className="text-center text-xs text-muted-foreground/80">
                   <p>{content.disclaimer}</p>
                </div>
            </div>
        </footer>
    );
}
