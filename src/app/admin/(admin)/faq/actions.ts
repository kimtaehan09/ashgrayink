
'use server';

import { db } from '@/lib/firebase';
import { ref, get, set, child } from 'firebase/database';
import { revalidatePath } from 'next/cache';
import type { FaqSectionData } from './types';


export async function getFaqData(): Promise<FaqSectionData> {
  try {
    const snapshot = await get(child(ref(db), `sections/faq`));
    if (snapshot.exists()) {
      const data = snapshot.val();
      // Ensure data structure is correct for backward compatibility
      if (data.title || data.subtitle) {
          const newStructure: FaqSectionData = {
              desktop: { title: data.title, subtitle: data.subtitle },
              mobile: { title: data.title, subtitle: data.subtitle },
              items: data.items || [],
          };
          await set(ref(db, 'sections/faq'), newStructure);
          return newStructure;
      }
      if (!data.items) {
          data.items = [];
      }
      return data;
    } else {
      // Return default data if nothing is in the database
      const defaultContent = {
        title: 'FAQ',
        subtitle: 'Frequently Asked Questions',
      };
      return {
        desktop: defaultContent,
        mobile: defaultContent,
        items: [
            { id: 'faq-1', question: 'HOW DO I BOOK AN APPOINTMENT?', answer: 'Once you\'ve selected your preferred artist, you can either stop by the shop, call us, or send a detailed email with a description of the design, some photo references, and your preferred dates to schedule. This will enable us to process your request quickly and efficiently. We schedule appointments a maximum of three months in advance. Our talented Associates are always available to answer your questions via phone - and they actually like talking to people!' },
            { id: 'faq-2', question: 'DOES IT HURT?', answer: 'Yes! But in the best possible way. Your brain releases endorphins when you go through pain and your body loves endorphins, so yes, it hurts, but you\'ll kinda like it.' },
            { id: 'faq-3', question: 'HOW OLD DO I HAVE TO BE TO GET A TATTOO?', answer: 'You must be at least 18 years of age. It is against Ontario law to tattoo a minor, even with parental consent. In accordance with this law we have a strict No Minors policy. Not only must you be 18, every client must prove it with a valid government-issued photo ID. No exceptions.' },
            { id: 'faq-4', question: 'HOW LONG DOES A TATTOO TAKE TO HEAL?', answer: 'It takes two-three weeks to "heal," but it takes months for the skin to fully regenerate.' },
            { id: 'faq-5', question: 'HOW MUCH DOES A TATTOO COST?', answer: 'It depends on the artist, but all tattoos start at $150. Final price is dependent on size, detail of the design, location on the body where it will be placed, and finally, which artist you\'ve chosen. Some artists have a minimum hourly billing, which varies.' },
            { id: 'faq-6', question: 'HOW DO I CARE FOR MY NEW TATTOO?', answer: 'Every shop has their own recommended care methods. You will be given an instruction card after you\'ve been tattooed.' }
        ]
      };
    }
  } catch (error) {
    console.error('Error fetching FAQ data:', error);
    throw new Error('Could not fetch FAQ section data.');
  }
}

export async function saveFaqData(
  data: FaqSectionData,
  idToken: string
): Promise<{ success: boolean; error?: string }> {
    const DATABASE_URL = process.env.FIREBASE_DATABASE_URL;
    if (!DATABASE_URL) {
      return { success: false, error: 'Firebase database URL is not configured.' };
    }
    try {
        const response = await fetch(`${DATABASE_URL}/sections/faq.json?auth=${idToken}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save FAQ data to Firebase.');
        }

        revalidatePath('/', 'layout');

        return { success: true };
    } catch (error: any) {
        console.error('Error saving FAQ data:', error);
        return { success: false, error: error.message || 'Failed to save data.' };
    }
}
