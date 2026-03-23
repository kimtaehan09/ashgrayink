import * as z from 'zod';

export const knowledgeItemSchema = z.object({
  id: z.string(),
  question: z.string().min(1, 'Question is required.'),
  answer: z.string().min(1, 'Answer is required.'),
});

export const formSchema = z.object({
  items: z.array(knowledgeItemSchema),
});

export type KnowledgeItem = z.infer<typeof knowledgeItemSchema>;
export type KnowledgeSectionData = z.infer<typeof formSchema>;
