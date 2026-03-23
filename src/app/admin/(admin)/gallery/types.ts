
import * as z from 'zod';

export const galleryCategories = [
    { value: 'black-and-gray', label: 'Black&Grey' },
    { value: 'color', label: 'Colour' }
];

const mediaItemSchema = z.object({
  id: z.string(),
  type: z.enum(['image', 'video']),
  src: z.string().optional(), // Media source can be empty initially
  preview: z.string().optional(), // For client-side preview
  category: z.string().min(1, 'Category is required.'),
});

export const galleryMediaItemSchema = mediaItemSchema.refine(data => {
    return !!data.preview || !!data.src;
}, {
    message: "A file must be uploaded.",
    path: ["src"]
});

export const formSchema = z.object({
  textContent: z.object({
      title: z.string().min(1, 'Title is required.'),
      subtitle: z.string(),
  }),
  mainMedia: z.array(galleryMediaItemSchema),
  additionalMedia: z.array(galleryMediaItemSchema),
});


export type GalleryMediaItem = z.infer<typeof galleryMediaItemSchema>;
export type GalleryFormValues = z.infer<typeof formSchema>;
