
import * as z from 'zod';

export const faqItemSchema = z.object({
  id: z.string(),
  question: z.string().min(1, 'Question is required.'),
  answer: z.string().min(1, 'Answer is required.'),
});

const faqContentSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  subtitle: z.string(),
});

export const formSchema = z.object({
  desktop: faqContentSchema,
  mobile: faqContentSchema,
  items: z.array(faqItemSchema),
});

export type FaqItem = z.infer<typeof faqItemSchema>;
export type FaqSectionData = z.infer<typeof formSchema>;

    