
'use server';

import { db } from '@/lib/firebase';
import { ref, get, set, child } from 'firebase/database';
import { revalidatePath } from 'next/cache';

export interface Stat {
  value: string;
  label: string;
}

export interface AboutContent {
  title: string;
  description: string;
}

export interface AboutSectionData {
  desktop: AboutContent;
  mobile: AboutContent;
  imageUrl: string;
  stats: Stat[];
}


export async function getAboutData(): Promise<AboutSectionData> {
  try {
    const snapshot = await get(child(ref(db), `sections/about`));
    if (snapshot.exists()) {
      const data = snapshot.val();
       // Ensure data structure is correct for backward compatibility
      if (data.title || data.description) {
        const newStructure: AboutSectionData = {
          desktop: {
            title: data.title,
            description: data.description,
          },
          mobile: {
            title: data.title,
            description: data.description,
          },
          imageUrl: data.imageUrl,
          stats: data.stats,
        };
        await set(ref(db, 'sections/about'), newStructure);
        return newStructure;
      }
      return data;
    } else {
      // Return default data if nothing is in the database
      const defaultContent: AboutContent = {
        title: 'OUR STORY',
        description:
          'Founded In 2010, Ashgray Ink has become a cornerstone of the Toronto tattoo scene. We are a collective of passionate, multi-award-winning artists dedicated to creating unique, high-quality tattoos in a clean, welcoming, and professional environment. Our artists specialize in a wide range of styles, from traditional and neo-traditional to blackwork, realism, and fine-line.\nWe believe that every tattoo tells a story, and we are committed to making the journey as memorable as the art itself. From the initial consultation where we turn your ideas into a custom design, to our meticulous aftercare guidance, we ensure a collaborative and safe experience. Our strict adherence to the highest standards of hygiene and safety is our promise to you.\nAre you ready to transform your vision into a work of art? We invite you to explore our portfolios and book a consultation. Let\'s create something beautiful together.',
      };
      return {
        desktop: defaultContent,
        mobile: defaultContent,
        imageUrl: 'https://picsum.photos/800/600',
        stats: [
            { value: "10+", label: "Years of Excellence" },
            { value: "8,000+", label: "Satisfied Clients" },
            { value: "5", label: "World-Class Artists" },
            { value: "5", label: "Client Rated" }
        ]
      };
    }
  } catch (error) {
    console.error('Error fetching about data:', error);
    throw new Error('Could not fetch about section data.');
  }
}

export async function saveAboutData(
  data: AboutSectionData,
  idToken: string
): Promise<{ success: boolean; error?: string }> {
    let DATABASE_URL = process.env.FIREBASE_DATABASE_URL;
    
    // Remove trailing slash if present
    if (DATABASE_URL?.endsWith('/')) {
        DATABASE_URL = DATABASE_URL.slice(0, -1);
    }

    if (!DATABASE_URL) {
      return { success: false, error: 'Firebase 데이터베이스 URL이 설정되지 않았습니다. .env.local 파일을 확인해주세요.' };
    }

    try {
        const response = await fetch(`${DATABASE_URL}/sections/about.json?auth=${idToken}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save data to Firebase.');
        }

        revalidatePath('/', 'layout');

        return { success: true };
    } catch (error: any) {
        console.error('Error saving about data:', error);
        return { success: false, error: error.message || 'Failed to save data.' };
    }
}
