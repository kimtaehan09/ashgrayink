
'use server';

import { db } from '@/lib/firebase';
import { ref as dbRef, get, set, child } from 'firebase/database';
import { revalidatePath } from 'next/cache';
import type { GalleryMediaItem } from './types';

export interface GalleryTextContent {
    title: string;
    subtitle: string;
}

export interface GalleryData {
    textContent: GalleryTextContent;
    mainMedia: GalleryMediaItem[];
    additionalMedia: GalleryMediaItem[];
}

export async function getGalleryData(): Promise<GalleryData> {
  try {
    const snapshot = await get(child(dbRef(db), `sections/gallery`));
    if (snapshot.exists()) {
      const data = snapshot.val();
      
      // Backward compatibility for old structure
      if (data.media) {
        const mainMedia = data.media.slice(0, 9);
        const additionalMedia = data.media.slice(9);
        return {
          textContent: data.textContent || { title: 'GALLERY', subtitle: 'Explore our latest work.' },
          mainMedia,
          additionalMedia,
        };
      }

      return {
        textContent: data.textContent || { title: 'GALLERY', subtitle: 'Explore our latest work.' },
        mainMedia: data.mainMedia || [],
        additionalMedia: data.additionalMedia || [],
      };
    } else {
      // Return default data if nothing is in the database
      return {
        textContent: {
            title: 'GALLERY',
            subtitle: 'Every tattoo starts with a story. Sometimes it\'s as simple as, "I got it because it\'s cool," and sometimes it carries a deeper meaning—family, memories, transformation. Whatever the reason, we believe every story starts with you.',
        },
        mainMedia: [
          { id: 'gallery-1', type: 'image', src: 'https://picsum.photos/seed/g1/600/600', category: 'black-and-gray' },
          { id: 'gallery-2', type: 'image', src: 'https://picsum.photos/seed/g2/600/600', category: 'black-and-gray' },
          { id: 'gallery-3', type: 'image', src: 'https://picsum.photos/seed/g3/600/600', category: 'black-and-gray' },
          { id: 'gallery-4', type: 'image', src: 'https://picsum.photos/seed/g4/600/600', category: 'black-and-gray' },
          { id: 'gallery-5', type: 'image', src: 'https://picsum.photos/seed/g5/600/600', category: 'black-and-gray' },
          { id: 'gallery-6', type: 'image', src: 'https://picsum.photos/seed/g6/600/600', category: 'black-and-gray' },
          { id: 'gallery-7', type: 'image', src: 'https://picsum.photos/seed/g7/600/600', category: 'color' },
          { id: 'gallery-8', type: 'image', src: 'https://picsum.photos/seed/g8/600/600', category: 'color' },
          { id: 'gallery-9', type: 'image', src: 'https://picsum.photos/seed/g9/600/600', category: 'color' },
        ],
        additionalMedia: [],
      };
    }
  } catch (error) {
    console.error('Error fetching gallery data:', error);
    throw new Error('Could not fetch gallery section data.');
  }
}

export async function saveGalleryData(
  data: GalleryData,
  idToken: string
): Promise<{ success: boolean; error?: string }> {
  const DATABASE_URL = process.env.FIREBASE_DATABASE_URL;
  if (!DATABASE_URL) {
    return { success: false, error: 'Firebase database URL is not configured.' };
  }
  try {
    // Sanitize data before saving, removing temporary properties
    const dataToSave = {
      ...data,
      mainMedia: data.mainMedia.map(({ preview, ...item }) => item),
      additionalMedia: data.additionalMedia.map(({ preview, ...item }) => item),
    };

    const response = await fetch(`${DATABASE_URL}/sections/gallery.json?auth=${idToken}`, {
      method: 'PUT',
      body: JSON.stringify(dataToSave),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save gallery data to Firebase.');
    }

    revalidatePath('/', 'layout');
    revalidatePath('/gallery', 'page');


    return { success: true };
  } catch (error: any) {
    console.error('Error saving gallery data:', error);
    return { success: false, error: error.message || 'Failed to save data.' };
  }
}
