
import * as z from 'zod';

const appointmentTextContentSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  subtitle: z.string().min(1, 'Subtitle is required.'),
});

export const formSchema = z.object({
  desktop: appointmentTextContentSchema,
  mobile: appointmentTextContentSchema,
});

export type AppointmentContentData = z.infer<typeof formSchema>;
