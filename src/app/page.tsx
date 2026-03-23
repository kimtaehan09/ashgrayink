
import Header from '@/components/header';
import Hero from '@/components/hero';
import ArtistPortfolio from '@/components/artist-portfolio';
import Location from '@/components/location';
import Faq from '@/components/faq';
import Footer from '@/components/footer';
import AppointmentForm from '@/components/appointment-form';
import Chatbot from '@/components/chatbot';
import AboutSection from '@/components/about-section';
import Gallery from '@/components/gallery';

import { getAboutData } from '@/app/admin/(admin)/about/actions';
import { getArtistsData, getArtistContentData } from '@/app/admin/(admin)/artists/actions';
import { getAppointmentContentData } from '@/app/admin/(admin)/appointment-content/actions';
import { getGalleryData } from '@/app/admin/(admin)/gallery/actions';
import { getLocationData } from '@/app/admin/(admin)/location/actions';
import { getFaqData } from '@/app/admin/(admin)/faq/actions';
import { getFooterData } from '@/app/admin/(admin)/footer/actions';
import { getHeroData } from '@/app/admin/(admin)/hero/actions';


export default async function Home() {
  const [
    heroData,
    aboutData,
    artistContentData,
    artists,
    galleryData,
    appointmentContentData,
    locationData,
    faqData,
    footerData,
  ] = await Promise.all([
    getHeroData(),
    getAboutData(),
    getArtistContentData(),
    getArtistsData(),
    getGalleryData(),
    getAppointmentContentData(),
    getLocationData(),
    getFaqData(),
    getFooterData(),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <Hero initialData={heroData} />
        <AboutSection initialData={aboutData} />
        <ArtistPortfolio initialArtistsData={artists} initialContentData={artistContentData} />
        <Gallery initialData={galleryData} />
        <AppointmentForm initialContentData={appointmentContentData} initialArtists={artists} />
        <Location initialData={locationData} />
        <Faq initialData={faqData} />
      </main>
      <Footer initialData={footerData} />
      <Chatbot />
    </div>
  );
}
