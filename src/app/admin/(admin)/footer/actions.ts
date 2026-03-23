
'use server';

import { db } from '@/lib/firebase';
import { ref, get, set, child } from 'firebase/database';
import { revalidatePath } from 'next/cache';

export interface FooterLink {
    label: string;
    url: string;
}

export interface SocialLink {
    platform: 'instagram' | 'facebook' | 'x' | 'youtube';
    url: string;
}

export interface FooterContent {
    copyrightText: string;
    disclaimer: string;
}

export interface FooterData {
    desktop: FooterContent;
    mobile: FooterContent;
    links: FooterLink[];
    socialLinks: SocialLink[];
}

export async function getFooterData(): Promise<FooterData> {
  try {
    const snapshot = await get(child(ref(db), `sections/footer`));
    if (snapshot.exists()) {
      const data = snapshot.val();
       if (data.copyrightText || data.disclaimer || !data.socialLinks) {
            const newStructure: FooterData = {
                desktop: { copyrightText: data.desktop?.copyrightText || data.copyrightText, disclaimer: data.desktop?.disclaimer || data.disclaimer },
                mobile: { copyrightText: data.mobile?.copyrightText || data.copyrightText, disclaimer: data.mobile?.disclaimer || data.disclaimer },
                links: data.links || [],
                socialLinks: data.socialLinks || [
                    { platform: 'instagram', url: 'https://www.instagram.com/ashgray_ink/?hl=ko' },
                    { platform: 'facebook', url: '#' }
                ]
            };
            await set(ref(db, 'sections/footer'), newStructure);
            return newStructure;
       }
       if (!data.links) {
           data.links = [];
       }
       if (!data.socialLinks) {
            data.socialLinks = [
                { platform: 'instagram', url: 'https://www.instagram.com/ashgray_ink/?hl=ko' },
                { platform: 'facebook', url: '#' }
            ];
       }
      return data;
    } else {
      // Return default data if nothing is in the database
      const defaultContent = {
        copyrightText: '© 2024 Ashgray Ink. All rights reserved.',
        disclaimer: 'Professional tattoo services provided by licensed artists in a sterile and safe environment. Must be 18 or older with valid photo ID. Consultations are by appointment. Walk-ins are welcome, subject to availability. A 25% deposit is required for all bookings.',
      };
      return {
        desktop: defaultContent,
        mobile: defaultContent,
        links: [
            { label: 'Privacy Policy', url: '/privacy-policy' },
            { label: 'Terms of Service', url: '/terms-of-service' },
            { label: 'Accessibility Statement', url: '/accessibility-statement' }
        ],
        socialLinks: [
            { platform: 'instagram', url: 'https://www.instagram.com/ashgray_ink/?hl=ko' },
            { platform: 'facebook', url: '#' }
        ]
      };
    }
  } catch (error) {
    console.error('Error fetching footer data:', error);
    throw new Error('Could not fetch footer section data.');
  }
}

export async function saveFooterData(
  data: FooterData,
  idToken: string
): Promise<{ success: boolean; error?: string }> {
    const DATABASE_URL = process.env.FIREBASE_DATABASE_URL;
    if (!DATABASE_URL) {
      return { success: false, error: 'Firebase database URL is not configured.' };
    }
    try {
        const response = await fetch(`${DATABASE_URL}/sections/footer.json?auth=${idToken}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save footer data to Firebase.');
        }

        revalidatePath('/', 'layout');

        return { success: true };
    } catch (error: any) {
        console.error('Error saving footer data:', error);
        return { success: false, error: error.message || 'Failed to save data.' };
    }
}
