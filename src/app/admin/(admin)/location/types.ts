

import * as z from 'zod';

const locationItemSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  content: z.string().min(1, 'Content is required.'),
});

const locationContentSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  subtitle: z.string(),
});

export const formSchema = z.object({
  desktop: locationContentSchema,
  mobile: locationContentSchema,
  mapEmbedUrl: z.string().url('Must be a valid URL.'),
  items: z.array(locationItemSchema),
});

export type LocationSectionData = z.infer<typeof formSchema>;

    