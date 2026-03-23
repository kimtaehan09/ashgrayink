'use server';
/**
 * @fileOverview A chatbot AI agent.
 *
 * - chat - A function that handles the chatbot conversation.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getLocationData } from '@/app/admin/(admin)/location/actions';
import { getArtistsData } from '@/app/admin/(admin)/artists/actions';
import { getAboutData } from '@/app/admin/(admin)/about/actions';
import { getFaqData } from '@/app/admin/(admin)/faq/actions';
import { getFooterData } from '@/app/admin/(admin)/footer/actions';
import { getChatbotKnowledgeData } from '@/app/admin/(admin)/chatbot-knowledge/actions';

const ChatInputSchema = z.object({
  message: z.string().describe('The user message to the chatbot.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe('The chatbot response.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {schema: z.object({
    message: ChatInputSchema.shape.message,
    websiteContext: z.string().describe("The full context of the tattoo shop's website, including information about the shop, artists, location, and FAQ."),
    additionalKnowledge: z.string().describe('Additional questions and answers provided by the admin for the chatbot to learn.'),
  })},
  output: {schema: ChatOutputSchema},
  prompt: `You are a helpful assistant for a tattoo shop called Ashgray Ink.
  Your goal is to answer user questions about the shop, artists, appointments, and tattoos in general.
  Use the context of the website and the additional knowledge provided to answer the questions. Be friendly and conversational.

  Website Context:
  {{websiteContext}}

  Additional Knowledge (use this to answer questions not covered by the website context):
  {{additionalKnowledge}}

  User message: {{{message}}}
  `,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async input => {
    // Fetch all relevant data from the website content actions
    const [
      aboutData,
      artistsData,
      locationData,
      faqData,
      footerData,
      knowledgeData,
    ] = await Promise.all([
      getAboutData(),
      getArtistsData(),
      getLocationData(),
      getFaqData(),
      getFooterData(),
      getChatbotKnowledgeData(),
    ]);
    
    // Format the data into a single context string
    const aboutStats = aboutData.stats.map(stat => `- ${stat.label}: ${stat.value}`).join('\n');
    const aboutContext = `About the shop: ${aboutData.desktop.title} - ${aboutData.desktop.description}\nKey Stats:\n${aboutStats}\n`;
    const artistsContext = 'Artists:\n' + artistsData.map(artist => `- ${artist.name}: Specializes in ${artist.styles}. ${artist.description}`).join('\n');
    const locationContext = '\nLocation and Contact:\n' + locationData.items.map(item => `- ${item.title}: ${item.content.replace(/\n/g, ', ')}`).join('\n');
    const faqContext = '\nFrequently Asked Questions:\n' + faqData.items.map(item => `- Q: ${item.question}\n  A: ${item.answer}`).join('\n');
    const socialContext = '\nSocial Media:\n' + footerData.socialLinks.map(link => `- ${link.platform}: ${link.url}`).join('\n');

    const websiteContext = [aboutContext, artistsContext, locationContext, faqContext, socialContext].join('\n');
    
    const additionalKnowledge = '\n' + knowledgeData.map(item => `- Q: ${item.question}\n  A: ${item.answer}`).join('\n');

    const {output} = await prompt({
        message: input.message,
        websiteContext: websiteContext,
        additionalKnowledge: additionalKnowledge,
    });
    return output!;
  }
);
