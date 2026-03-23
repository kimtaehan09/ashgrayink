
'use server';

import { db } from '@/lib/firebase';
import { ref, get, set } from 'firebase/database';
import { revalidatePath } from 'next/cache';

export interface PrivacyPolicyData {
  title: string;
  content: string;
}

export async function getPrivacyPolicyData(): Promise<PrivacyPolicyData> {
  try {
    const snapshot = await get(ref(db, 'sections/privacyPolicy'));
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      // Return default data if nothing is in the database
      return {
        title: 'Privacy Policy',
        content: `This is a placeholder for the Privacy Policy page. Please replace this with your actual privacy policy.

1. Introduction
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum.

2. Information We Collect
Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.

3. How We Use Your Information
Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor.
`,
      };
    }
  } catch (error) {
    console.error('Error fetching privacy policy data:', error);
    throw new Error('Could not fetch privacy policy data.');
  }
}

export async function savePrivacyPolicyData(
  data: PrivacyPolicyData,
  idToken: string
): Promise<{ success: boolean; error?: string }> {
    const DATABASE_URL = process.env.FIREBASE_DATABASE_URL;
    if (!DATABASE_URL) {
      return { success: false, error: 'Firebase database URL is not configured.' };
    }

    try {
        const response = await fetch(`${DATABASE_URL}/sections/privacyPolicy.json?auth=${idToken}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save data to Firebase.');
        }

        revalidatePath('/privacy-policy');
        return { success: true };
    } catch (error: any) {
        console.error('Error saving privacy policy data:', error);
        return { success: false, error: error.message || 'Failed to save data.' };
    }
}
