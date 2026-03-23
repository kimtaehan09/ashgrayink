
'use server';

import { db } from '@/lib/firebase';
import { ref, get, set, child } from 'firebase/database';
import { revalidatePath } from 'next/cache';

// Types are moved to the components that use them to avoid exporting non-async
// values from a 'use server' file.

export interface ColorTheme {
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  card: string;
  cardForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
}

export interface FontTheme {
    baseSize: number;
}

export interface ThemeSectionData {
  colors: ColorTheme;
  fonts: FontTheme;
}

export async function getThemeData(): Promise<ThemeSectionData> {
  try {
    const snapshot = await get(child(ref(db), `sections/theme`));
    if (snapshot.exists()) {
      const data = snapshot.val();
      // Ensure fonts object and baseSize exist to prevent errors
      if (!data.fonts) {
        data.fonts = { baseSize: 16 };
      } else if (typeof data.fonts.baseSize !== 'number') {
        data.fonts.baseSize = 16;
      }
      return data;
    } else {
      // Return default data if nothing is in the database
      return {
        colors: {
          background: '#FFFFFF',
          foreground: '#0A0A0A',
          primary: '#5A4FCF',
          primaryForeground: '#F8F8F8',
          card: '#FFFFFF',
          cardForeground: '#0A0A0A',
          accent: '#CF4F85',
          accentForeground: '#F8F8F8',
          border: '#E5E5E5'
        },
        fonts: {
          baseSize: 16
        }
      };
    }
  } catch (error) {
    console.error('Error fetching theme data:', error);
    throw new Error('Could not fetch theme section data.');
  }
}

export async function saveThemeData(
  data: ThemeSectionData,
  idToken: string
): Promise<{ success: boolean; error?: string }> {
    const DATABASE_URL = process.env.FIREBASE_DATABASE_URL;
    if (!DATABASE_URL) {
      return { success: false, error: 'Firebase database URL is not configured.' };
    }
    try {
        const response = await fetch(`${DATABASE_URL}/sections/theme.json?auth=${idToken}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save theme data to Firebase.');
        }

        revalidatePath('/', 'layout');

        return { success: true };
    } catch (error: any) {
        console.error('Error saving theme data:', error);
        return { success: false, error: error.message || 'Failed to save data.' };
    }
}
