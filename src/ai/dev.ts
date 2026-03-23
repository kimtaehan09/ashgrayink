
'use server';

import { config } from 'dotenv';
config();

import '@/ai/flows/generate-tattoo-inspiration.ts';
import '@/ai/flows/chat.ts';
import '@/ai/flows/send-booking-confirmation.ts';
