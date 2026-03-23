
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export const dynamic = 'force-dynamic';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Ash Gray Ink.',
  description: 'Ash Gray Ink — a trusted studio where your story is turned into art, expressed through diverse styles.',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Ash Gray Ink.',
    description: 'Ash Gray Ink — a trusted studio where your story is turned into art, expressed through diverse styles.',
    url: 'https://www.ashgrayink.com',
    siteName: 'Ash Gray Ink',
    images: [
      {
        url: 'https://ashgrayink.com/main.png', // OG image in public folder
        width: 1200,
        height: 630,
        alt: 'Ash Gray Ink 대표 이미지',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="font-body antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Gothic+A1:wght@400;700;900&family=Lilita+One&family=Luckiest+Guy&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
