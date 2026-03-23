
'use server';

import { db } from '@/lib/firebase';
import { ref as dbRef, get, set, child } from 'firebase/database';
import { revalidatePath } from 'next/cache';
import type { Artist } from './form';

export interface ArtistTextContent {
    title: string;
    subtitle: string;
}

export interface ArtistContentData {
    desktop: ArtistTextContent;
    mobile: ArtistTextContent;
}

export async function getArtistContentData(): Promise<ArtistContentData> {
    try {
        const snapshot = await get(child(dbRef(db), 'sections/artistContent'));
        if (snapshot.exists()) {
            const data = snapshot.val();
            if (data.title || data.subtitle) {
                const newStructure: ArtistContentData = {
                    desktop: { title: data.title, subtitle: data.subtitle },
                    mobile: { title: data.title, subtitle: data.subtitle }
                };
                await set(dbRef(db, 'sections/artistContent'), newStructure);
                return newStructure;
            }
            return data;
        } else {
             const defaultContent: ArtistTextContent = {
                title: 'ARTISTS',
                subtitle: 'Meet our world-renowned team of tattoo artists, each bringing their unique style and expertise to create extraordinary works of art.'
            };
            return {
                desktop: defaultContent,
                mobile: defaultContent,
            };
        }
    } catch (error) {
        console.error('Error fetching artist content data:', error);
        throw new Error('Could not fetch artist content data.');
    }
}

export async function saveArtistContentData(
    data: ArtistContentData,
    idToken: string
): Promise<{ success: boolean; error?: string }> {
    const DATABASE_URL = process.env.FIREBASE_DATABASE_URL;
    if (!DATABASE_URL) {
      return { success: false, error: 'Firebase database URL is not configured.' };
    }
    try {
        const response = await fetch(`${DATABASE_URL}/sections/artistContent.json?auth=${idToken}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save artist content data to Firebase.');
        }

        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error: any) {
        console.error('Error saving artist content data:', error);
        return { success: false, error: error.message || 'Failed to save data.' };
    }
}


export async function getArtistsData(): Promise<Artist[]> {
  try {
    const snapshot = await get(child(dbRef(db), `sections/artists`));
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      // Return default data if nothing is in the database
      return [
        {
          id: 'TK_KIM',
          name: 'TK_KIM',
          styles: 'Traditional & Neo-Traditional',
          description: 'Specializing in bold traditional and neo-traditional designs with a modern twist.',
          galleryUrl: '#',
          image: { src: 'https://picsum.photos/seed/artist1/400/600', alt: 'Tattoo artist TK KIM', hint: 'tattoo artist' },
        },
        {
          id: 'OLIVIA',
          name: 'OLIVIA',
          styles: 'Fine-line & Realism & Watercolor',
          description: 'Master of fine-line and realism, creating delicate and detailed masterpieces.',
          galleryUrl: '#',
          image: { src: 'https://picsum.photos/seed/artist2/400/600', alt: 'Tattoo artist Olivia', hint: 'cafe person' },
        },
        {
          id: 'NOAH',
          name: 'NOAH',
          styles: 'Geometric & Blackwork & Tribal',
          description: 'Expert in geometric and blackwork, focusing on symmetry and abstract patterns.',
          galleryUrl: '#',
          image: { src: 'https://picsum.photos/seed/artist3/400/600', alt: 'Tattoo artist Noah', hint: 'winding road' },
        },
        {
          id: 'EMMA',
          name: 'EMMA',
          styles: 'Watercolor & New School & Japanese',
          description: 'Loves vibrant colors and expressive art, focusing on watercolor and new school styles.',
          galleryUrl: '#',
          image: { src: 'https://picsum.photos/seed/artist4/400/600', alt: 'Tattoo artist Emma', hint: 'misty field' },
        },
      ];
    }
  } catch (error) {
    console.error('Error fetching artists data:', error);
    throw new Error('Could not fetch artists section data.');
  }
}

export async function saveArtistsData(
  artists: Artist[],
  idToken: string
): Promise<{ success: boolean; error?: string }> {
  const DATABASE_URL = process.env.FIREBASE_DATABASE_URL;
  if (!DATABASE_URL) {
    return { success: false, error: 'Firebase database URL is not configured.' };
  }
  try {
    const response = await fetch(`${DATABASE_URL}/sections/artists.json?auth=${idToken}`, {
      method: 'PUT',
      body: JSON.stringify(artists),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save artists data to Firebase.');
    }

    revalidatePath('/', 'layout');

    return { success: true };
  } catch (error: any) {
    console.error('Error saving artists data:', error);
    return { success: false, error: error.message || 'Failed to save data.' };
  }
}
