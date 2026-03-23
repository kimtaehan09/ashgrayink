
'use server';

import { db } from '@/lib/firebase';
import { ref, set, push, remove } from 'firebase/database';
import { revalidatePath } from 'next/cache';
import type { AppointmentData } from './page';
import { sendBookingConfirmation } from '@/ai/flows/send-booking-confirmation';

const DATABASE_URL = process.env.FIREBASE_DATABASE_URL || "https://inkhub-dpktu-default-rtdb.firebaseio.com";

export async function getAppointmentRequests(idToken: string): Promise<AppointmentData[]> {
  try {
    const response = await fetch(`${DATABASE_URL}/appointments.json?auth=${idToken}`);
    
    if (!response.ok) {
        const errorData = await response.json();
        console.error('Firebase error:', errorData);
        throw new Error(errorData.error || 'Could not fetch appointment requests.');
    }

    const data = await response.json();
    
    if (data) {
      return Object.entries(data)
        .map(([id, appointment]: [string, any]) => ({
          ...appointment,
          id,
        }))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return [];
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw new Error('Could not fetch appointment requests.');
  }
}

export async function saveAppointmentRequest(
  data: Omit<AppointmentData, 'id' | 'createdAt'>
): Promise<{ success: boolean; error?: string }> {
  try {
    // This action is called from a public page, so it doesn't need auth token
    const appointmentsRef = ref(db, 'appointments');
    const newAppointmentRef = push(appointmentsRef);
    
    const createdAt = new Date().toISOString();
    const newAppointmentData = {
      ...data,
      createdAt,
    };
    
    await set(newAppointmentRef, newAppointmentData);
    console.log('Appointment saved to Firebase successfully.');
    
    revalidatePath('/admin/appointments');
    
    // Diagnostic check for environment variables (Server-side)
    const hasEmailUser = !!process.env.EMAIL_USER;
    const hasEmailPass = !!process.env.EMAIL_PASS;
    console.log(`Environment check: EMAIL_USER=${hasEmailUser}, EMAIL_PASS=${hasEmailPass}`);

    try {
      if (!hasEmailUser || !hasEmailPass) {
        throw new Error(`Email configuration missing on server (User: ${hasEmailUser}, Pass: ${hasEmailPass})`);
      }
      const emailResult = await sendBookingConfirmation({ appointmentDetails: newAppointmentData });
      if (!emailResult.success) {
          console.error('Booking email notification failed:', emailResult.message);
      } else {
          console.log('Booking email notification sent successfully.');
      }
    } catch (emailError) {
      console.error('Failed to send email notification during appointment save:', emailError);
      // We don't fail the whole request just because email failed, but we log it.
    }

    return { success: true };
  } catch (error: any) {
    console.error('CRITICAL: Error in saveAppointmentRequest:', error);
    return { success: false, error: error.message || 'Failed to save appointment request.' };
  }
}

export async function deleteAppointmentRequest(
  id: string,
  idToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${DATABASE_URL}/appointments/${id}.json?auth=${idToken}`, {
        method: 'DELETE'
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete appointment.');
    }

    revalidatePath('/admin/appointments');
    return { success: true };
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return { success: false, error: 'Failed to delete appointment.' };
  }
}
