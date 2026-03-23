
'use server';

import { db, storage } from '@/lib/firebase';
import { ref, get, set, child } from 'firebase/database';
import {
  ref as storageRef,
  uploadString,
  getDownloadURL,
} from 'firebase/storage';
import { revalidatePath } from 'next/cache';

export interface HeroContent {
  subtitle: string;
  buttonText: string;
}

export interface HeroSectionData {
  desktop: HeroContent;
  mobile: HeroContent;
  logoUrl: string;
  desktopBackgroundType: 'image' | 'video';
  mobileBackgroundType: 'image' | 'video';
  imageUrl: string;
  videoUrl: string;
  imageScale: number;
}


export async function getHeroData(): Promise<HeroSectionData> {
  try {
    const snapshot = await get(child(ref(db), `sections/hero`));

    if (snapshot.exists()) {
      const data = snapshot.val();
      // Ensure all fields have a default value if they are missing from the database.
      const defaultContent: HeroContent = {
        subtitle: 'Your Story, Inked.',
        buttonText: 'MAKE AN APPOINTMENT',
      };
      return {
        desktop: data.desktop || defaultContent,
        mobile: data.mobile || defaultContent,
        logoUrl: data.logoUrl || 'https://firebasestorage.googleapis.com/v0/b/inkhub-dpktu.firebasestorage.app/o/hero%2F%EC%A0%9C%EB%AA%A9%EC%9D%84-%EC%9E%85%EB%A0%A5%ED%95%B4%EC%A3%BC%EC%84%B8%EC%9A%94_-001%20(3).png?alt=media&token=ac7a2fba-5142-4865-920d-18f99ff53b33',
        desktopBackgroundType: data.desktopBackgroundType || data.backgroundType || 'video',
        mobileBackgroundType: data.mobileBackgroundType || data.backgroundType || 'video',
        imageUrl: data.imageUrl || 'https://picsum.photos/seed/background/1920/1080',
        videoUrl: data.videoUrl || 'https://firebasestorage.googleapis.com/v0/b/inkhub-dpktu.appspot.com/o/hero%2Fhero-bg-video%20(1).mp4?alt=media&token=8304a28f-eadb-4a8b-9dd6-5e60374bd116',
        imageScale: data.imageScale || 100,
      };
    } else {
      // Return default data if nothing is in the database
      const defaultContent: HeroContent = {
        subtitle: 'Your Story, Inked.',
        buttonText: 'MAKE AN APPOINTMENT',
      };
      
      return {
        desktop: defaultContent,
        mobile: defaultContent,
        logoUrl: 'https://firebasestorage.googleapis.com/v0/b/inkhub-dpktu.firebasestorage.app/o/hero%2F%EC%A0%9C%EB%AA%A9%EC%9D%84-%EC%9E%85%EB%A0%A5%ED%95%B4%EC%A3%BC%EC%84%B8%EC%9A%94_-001%20(3).png?alt=media&token=ac7a2fba-5142-4865-920d-18f99ff53b33',
        desktopBackgroundType: 'video',
        mobileBackgroundType: 'video',
        imageUrl: 'https://picsum.photos/seed/background/1920/1080',
        videoUrl: 'https://firebasestorage.googleapis.com/v0/b/inkhub-dpktu.appspot.com/o/hero%2Fhero-bg-video%20(1).mp4?alt=media&token=8304a28f-eadb-4a8b-9dd6-5e60374bd116',
        imageScale: 100,
      };
    }
  } catch (error) {
    console.error('Error fetching hero data:', error);
    throw new Error('Could not fetch hero section data.');
  }
}

export async function saveHeroData(
  data: Omit<HeroSectionData, 'backgroundType'>, // Omit old property
  idToken: string
): Promise<{ success: boolean; error?: string }> {
    const DATABASE_URL = process.env.FIREBASE_DATABASE_URL;
    if (!DATABASE_URL) {
      return { success: false, error: 'Firebase database URL is not configured.' };
    }

    try {
        const response = await fetch(`${DATABASE_URL}/sections/hero.json?auth=${idToken}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save hero data to Firebase.');
        }

        revalidatePath('/', 'layout');

        return { success: true };
    } catch (error: any) {
        console.error('Error saving hero data:', error);
        return { success: false, error: error.message || 'Failed to save data.' };
    }
}
