
'use server';

import { generateTattooInspiration, GenerateTattooInspirationInput } from '@/ai/flows/generate-tattoo-inspiration';
import { chat, ChatInput } from '@/ai/flows/chat';

export async function getInspirationAction(
  data: GenerateTattooInspirationInput
): Promise<{ suggestions?: string[]; error?: string; style?: string; }> {
  try {
    const result = await generateTattooInspiration(data);
    if (result.tattooSuggestions && result.tattooSuggestions.length > 0) {
        return { suggestions: result.tattooSuggestions, style: data.stylePreference };
    } else {
        return { error: "Couldn't generate ideas for this combination. Try something different!" };
    }
  } catch (e) {
    console.error(e);
    return { error: "An unexpected error occurred. Please try again later." };
  }
}

export async function chatAction(
  data: ChatInput
): Promise<{ response?: string; error?: string; }> {
    if (!data.message) {
        return { error: "Message cannot be empty." };
    }
  try {
    const result = await chat(data);
    if (result.response) {
        return { response: result.response };
    } else {
        return { error: "I'm sorry, I couldn't come up with a response. Please try asking something else." };
    }
  } catch (e) {
    console.error(e);
    return { error: "An unexpected error occurred. Please try again later." };
  }
}
