
'use server';

import { db } from '@/lib/firebase';
import { ref, get, set, child } from 'firebase/database';
import { revalidatePath } from 'next/cache';
import type { LocationSectionData } from './types';


export async function getLocationData(): Promise<LocationSectionData> {
  try {
    const snapshot = await get(child(ref(db), `sections/location`));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return data;
    } else {
      // Return default data if nothing is in the database
      const defaultContent = {
        title: 'VISIT OUR STUDIO',
        subtitle: 'Visit us at our flagship studio in the heart of downtown Toronto.',
      };
      return {
        desktop: defaultContent,
        mobile: defaultContent,
        mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2879.8886447477994!2d-79.43743062343935!3d43.79592364318768!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b2dad314e1533%3A0x28a4304fca576fbc!2zMzk4IFN0ZWVsZXMgQXZlIFcgIzIxNSwgVGhvcm5oaWxsLCBPTiBMNEogNlgzIOy6kOuCmOuLpA!5e0!3m2!1sko!2skr!4v1758089953550!5m2!1sko!2skr',
        items: [
            { title: 'ADDRESS', content: '123 Yonge Street, Toronto, ON M5C 2V6' },
            { title: 'HOURS', content: 'Monday - Saturday: 10:00 AM - 9:00 PM\nSunday: Closed\nConsultations: By Appointment Only' },
            { title: 'CONTACT', content: 'Phone: (416) 123-4567\nEmail: contact@ashgray.ink' },
            { title: 'GETTING HERE', content: 'Subway: Steps from Dundas Station\nParking: Nearby paid garages available' },
        ]
      };
    }
  } catch (error) {
    console.error('Error fetching location data:', error);
    throw new Error('Could not fetch location section data.');
  }
}

export async function saveLocationData(
  data: LocationSectionData,
  idToken: string
): Promise<{ success: boolean; error?: string }> {
    const DATABASE_URL = process.env.FIREBASE_DATABASE_URL;
    if (!DATABASE_URL) {
      return { success: false, error: 'Firebase database URL is not configured.' };
    }
    try {
        const response = await fetch(`${DATABASE_URL}/sections/location.json?auth=${idToken}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save location data to Firebase.');
        }

        revalidatePath('/', 'layout');

        return { success: true };
    } catch (error: any) {
        console.error('Error saving location data to Firebase:', error);
        return { success: false, error: error.message || 'Failed to save data to the database.' };
    }
}
