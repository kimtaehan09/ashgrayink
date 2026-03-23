
'use server';

import { db } from '@/lib/firebase';
import { ref, get, set, child } from 'firebase/database';
import { revalidatePath } from 'next/cache';
import type { AppointmentContentData } from './types';


export async function getAppointmentContentData(): Promise<AppointmentContentData> {
  try {
    const snapshot = await get(child(ref(db), `sections/appointmentContent`));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return data;
    } else {
      // Return default data if nothing is in the database
      const defaultContent = {
        title: 'APPOINTMENT REQUEST',
        subtitle: 'Ready to take the next step? Fill out the form below to begin your consultation process with one of our world-class artists.',
      };
      return {
        desktop: defaultContent,
        mobile: defaultContent,
      };
    }
  } catch (error) {
    console.error('Error fetching appointment content data:', error);
    throw new Error('Could not fetch appointment content data.');
  }
}

export async function saveAppointmentContentData(
  data: AppointmentContentData,
  idToken: string
): Promise<{ success: boolean; error?: string }> {
    const DATABASE_URL = process.env.FIREBASE_DATABASE_URL;
    if (!DATABASE_URL) {
      return { success: false, error: 'Firebase database URL is not configured.' };
    }
    try {
        const response = await fetch(`${DATABASE_URL}/sections/appointmentContent.json?auth=${idToken}`, {
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
        console.error('Error saving appointment content data:', error);
        return { success: false, error: error.message || 'Failed to save data.' };
    }
}
