
'use server';

import { db } from '@/lib/firebase';
import { ref, get, set } from 'firebase/database';
import { revalidatePath } from 'next/cache';
import type { KnowledgeItem } from './types';

export async function getChatbotKnowledgeData(): Promise<KnowledgeItem[]> {
  try {
    const snapshot = await get(ref(db, 'sections/chatbotKnowledge'));
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      // Return default data if nothing is in the database
      return [
        {
          id: 'knowledge-1',
          question: 'Do you offer vegan ink?',
          answer: 'Yes, all of our inks are 100% vegan and cruelty-free. We prioritize using high-quality, ethical products in our studio.'
        },
        {
          id: 'knowledge-2',
          question: 'What is your policy on touch-ups?',
          answer: 'We offer one free touch-up within the first 6 months for most tattoos, provided that you have followed our aftercare instructions correctly. Touch-ups for hands, feet, and faces are not always free and are at the artist\'s discretion.'
        }
      ];
    }
  } catch (error) {
    console.error('Error fetching chatbot knowledge data:', error);
    throw new Error('Could not fetch chatbot knowledge data.');
  }
}

export async function saveChatbotKnowledgeData(
  data: KnowledgeItem[],
  idToken: string
): Promise<{ success: boolean; error?: string }> {
    const DATABASE_URL = process.env.FIREBASE_DATABASE_URL;
    if (!DATABASE_URL) {
      return { success: false, error: 'Firebase database URL is not configured.' };
    }
    try {
        const response = await fetch(`${DATABASE_URL}/sections/chatbotKnowledge.json?auth=${idToken}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save chatbot knowledge data to Firebase.');
        }

        revalidatePath('/', 'layout');

        return { success: true };
    } catch (error: any) {
        console.error('Error saving chatbot knowledge data:', error);
        return { success: false, error: error.message || 'Failed to save data.' };
    }
}
