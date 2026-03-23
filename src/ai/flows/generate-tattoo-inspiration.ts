'use server';

/**
 * @fileOverview Tattoo inspiration AI agent.
 *
 * - generateTattooInspiration - A function that generates tattoo suggestions based on user preferences.
 * - GenerateTattooInspirationInput - The input type for the generateTattooInspiration function.
 * - GenerateTattooInspirationOutput - The return type for the generateTattooInspiration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTattooInspirationInputSchema = z.object({
  stylePreference: z
    .string()
    .describe('The preferred tattoo style (e.g., traditional, minimalist, watercolor).'),
  culturalSymbols: z
    .string()
    .describe('Any cultural symbols or themes the user is interested in.'),
  personalPreferences: z
    .string()
    .describe('Any personal preferences or meanings the user wants to incorporate.'),
});
export type GenerateTattooInspirationInput = z.infer<
  typeof GenerateTattooInspirationInputSchema
>;

const GenerateTattooInspirationOutputSchema = z.object({
  tattooSuggestions: z
    .array(z.string())
    .describe('An array of tattoo suggestions based on the user input.'),
});
export type GenerateTattooInspirationOutput = z.infer<
  typeof GenerateTattooInspirationOutputSchema
>;

export async function generateTattooInspiration(
  input: GenerateTattooInspirationInput
): Promise<GenerateTattooInspirationOutput> {
  return generateTattooInspirationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTattooInspirationPrompt',
  input: {schema: GenerateTattooInspirationInputSchema},
  output: {schema: GenerateTattooInspirationOutputSchema},
  prompt: `You are a tattoo design assistant. You will generate tattoo suggestions based on the user's preferences, cultural symbols, and personal preferences.

  Style Preference: {{{stylePreference}}}
  Cultural Symbols: {{{culturalSymbols}}}
  Personal Preferences: {{{personalPreferences}}}

  Suggest tattoo designs that incorporate these elements, considering popular designs, cultural meanings, and current trends.`,
});

const generateTattooInspirationFlow = ai.defineFlow(
  {
    name: 'generateTattooInspirationFlow',
    inputSchema: GenerateTattooInspirationInputSchema,
    outputSchema: GenerateTattooInspirationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
