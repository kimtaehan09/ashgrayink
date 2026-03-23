
'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '@/lib/firebase';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, GalleryHorizontal, Save, PlusCircle, Trash2, Image as ImageIcon, Video } from 'lucide-react';
import { saveGalleryData } from './actions';
import { useAuth } from '@/contexts/auth-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formSchema, type GalleryFormValues, type GalleryMediaItem, galleryCategories } from './types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';


interface GalleryFormProps {
  initialData: GalleryFormValues;
}

interface NewMediaFile {
    field: 'mainMedia' | 'additionalMedia';
    index: number;
    dataUrl: string;
    format: string;
}

export default function GalleryForm({ initialData }: GalleryFormProps) {
  const [isPending, startTransition] = useTransition();
  const [newMediaFiles, setNewMediaFiles] = useState<NewMediaFile[]>([]);
  const { user } = useAuth();

  const form = useForm<GalleryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        ...initialData,
        additionalMedia: initialData.additionalMedia.sort((a, b) => (b.id > a.id ? -1 : 1)),
    }
  });
  
  const { fields: mainMediaFields, update: updateMainMedia } = useFieldArray({
    control: form.control,
    name: 'mainMedia',
    keyName: 'fieldId'
  });

  const { fields: additionalMediaFields, prepend: prependAdditionalMedia, remove: removeAdditionalMedia, update: updateAdditionalMedia } = useFieldArray({
    control: form.control,
    name: 'additionalMedia',
    keyName: 'fieldId'
  });
  
  const watchMainMedia = form.watch('mainMedia');
  const watchAdditionalMedia = form.watch('additionalMedia');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, field: 'mainMedia' | 'additionalMedia', index: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const itemType = form.getValues(`${field}.${index}.type`);
    const maxSize = itemType === 'image' ? 4 * 1024 * 1024 : 100 * 1024 * 1024;
    if (file.size > maxSize) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: `${itemType === 'image' ? 'Image' : 'Video'} size cannot exceed ${itemType === 'image' ? '4MB' : '100MB'}.`,
        });
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        
        const updateFn = field === 'mainMedia' ? updateMainMedia : updateAdditionalMedia;
        updateFn(index, {
          ...form.getValues(`${field}.${index}`),
          preview: dataUrl,
        });

        const newFile: NewMediaFile = { field, index, dataUrl, format: file.type.split('/')[1] || (itemType === 'image' ? 'png' : 'mp4') };
        setNewMediaFiles(prev => [...prev.filter(f => f.field !== field || f.index !== index), newFile]);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAdditionalItem = (index: number) => {
    const itemToRemove = form.getValues(`additionalMedia.${index}`);

    if (itemToRemove.src && itemToRemove.src.includes('firebasestorage')) {
        try {
            const mediaRef = ref(storage, itemToRemove.src);
            deleteObject(mediaRef).catch(error => {
                if (error.code !== 'storage/object-not-found') {
                    console.error(`Error deleting media from storage:`, error);
                    toast({variant: 'destructive', title: 'Storage Error', description: `Could not delete the old media from storage.`})
                }
            })
        } catch (error) {
            console.error(`Error creating storage reference:`, error);
        }
    }
    
    removeAdditionalMedia(index);
    setNewMediaFiles(prev => prev
        .filter(f => f.field !== 'additionalMedia' || f.index !== index)
        .map(f => (f.field === 'additionalMedia' && f.index > index) ? { ...f, index: f.index - 1 } : f)
    );
  };
  
  const handleAddItem = () => {
    const newItemId = uuidv4();
    const newItem: GalleryMediaItem = {
        id: newItemId,
        type: 'image',
        src: '', // Initially empty, user must upload
        preview: 'https://picsum.photos/seed/new/600/600',
        category: 'black-and-gray',
    };
    prependAdditionalMedia(newItem, { shouldFocus: false });
  }

  const onSubmit = async (values: GalleryFormValues) => {
     if (!user) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to save changes.' });
      return;
    }
    startTransition(async () => {
      const idToken = await user.getIdToken();
      let mainMediaToSave = [...values.mainMedia];
      let additionalMediaToSave = [...values.additionalMedia];

      try {
        for (const newFile of newMediaFiles) {
            const mediaArray = newFile.field === 'mainMedia' ? mainMediaToSave : additionalMediaToSave;
            const item = mediaArray[newFile.index];

            if (item && item.preview && item.preview.startsWith('data:')) { // Only upload new files
                if(item.src && item.src.includes('firebasestorage')) {
                    try {
                        const oldMediaRef = ref(storage, item.src);
                        await deleteObject(oldMediaRef).catch(err => {
                             if (err.code !== 'storage/object-not-found') {
                                console.error("Could not delete old media, may not exist.", err)
                             }
                        });
                    } catch (error) {
                        console.error("Error creating old storage ref.", error)
                    }
                }
                const mediaRef = ref(storage, `gallery/${item.id}.${newFile.format}`);
                const uploadResult = await uploadString(mediaRef, item.preview, 'data_url');
                mediaArray[newFile.index].src = await getDownloadURL(uploadResult.ref);
            }
        }
      } catch (uploadError: any) {
         toast({
          variant: 'destructive',
          title: 'Media Upload Failed',
          description: uploadError.message || 'There was a problem with your request.',
        });
        return;
      }

      const finalData: GalleryFormValues = {
          textContent: values.textContent,
          mainMedia: mainMediaToSave,
          additionalMedia: additionalMediaToSave
      }

      const result = await saveGalleryData(finalData, idToken);

      if (result.success) {
        toast({
          title: 'Success!',
          description: 'Gallery section has been updated.',
        });
        setNewMediaFiles([]);
        
        const sortedAdditionalMedia = finalData.additionalMedia
            .map(item => ({...item, preview: item.src})) // ensure preview is populated
            .sort((a, b) => b.id.localeCompare(a.id));

        form.reset({
            ...finalData,
            additionalMedia: sortedAdditionalMedia
        });

      } else {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: result.error || 'There was a problem with your request.',
        });
      }
    });
  };

  const renderMediaItemForm = (field: 'mainMedia' | 'additionalMedia', index: number, item: any, watchArray: any[]) => {
    const currentType = watchArray[index]?.type;
    return (
        <div key={item.fieldId} className="flex flex-col gap-4 p-4 border rounded-md">
            <div className="flex justify-between items-center">
                <h3 className="font-medium">
                    {field === 'mainMedia' ? `Main Item #${index + 1}` : `Additional Item`}
                </h3>
                {field === 'additionalMedia' && (
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemoveAdditionalItem(index)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <FormField
                control={form.control}
                name={`${field}.${index}.type`}
                render={({ field }) => (
                    <FormItem className="space-y-3">
                        <FormLabel>Type</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-4"
                            >
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl><RadioGroupItem value="image" /></FormControl>
                                    <FormLabel className="font-normal flex items-center gap-1"><ImageIcon className="h-4 w-4" /> Image</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl><RadioGroupItem value="video" /></FormControl>
                                    <FormLabel className="font-normal flex items-center gap-1"><Video className="h-4 w-4" /> Video</FormLabel>
                                </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="space-y-2">
                {watchArray[index]?.preview ? (
                    <div className="relative w-full aspect-square rounded-md overflow-hidden border bg-muted">
                        {currentType === 'image' ? (
                                <Image src={watchArray[index].preview!} alt={`Preview ${index}`} fill className="object-cover" />
                        ) : (
                            <video key={watchArray[index].preview} src={watchArray[index].preview} controls className="w-full h-full object-contain" />
                        )}
                    </div>
                ) : watchArray[index]?.src ? (
                    <div className="relative w-full aspect-square rounded-md overflow-hidden border bg-muted">
                        {currentType === 'image' ? (
                                <Image src={watchArray[index].src} alt={`Preview ${index}`} fill className="object-cover" />
                        ) : (
                            <video key={watchArray[index].src} src={watchArray[index].src} controls className="w-full h-full object-contain" />
                        )}
                    </div>
                ) : (
                    <div className="relative w-full aspect-square rounded-md border bg-muted flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">Upload a file</p>
                    </div>
                )}
                
                <FormField
                    control={form.control}
                    name={`${field}.${index}.src`}
                    render={() => (
                    <FormItem>
                        <FormLabel className="sr-only">Media File</FormLabel>
                        <FormControl>
                        <Input 
                            type="file" 
                            accept={currentType === 'image' ? "image/png, image/jpeg, image/gif" : "video/mp4,video/webm"} 
                            onChange={(e) => handleFileChange(e, field, index)}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            
            <FormField
                control={form.control}
                name={`${field}.${index}.category`}
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                        <SelectContent>
                            {galleryCategories.map(cat => (
                                <SelectItem key={cat.value} value={cat.value}>
                                    {cat.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    )
  }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex items-center gap-4 mb-4">
                <GalleryHorizontal className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-2xl font-bold">Edit Gallery Section</h1>
                    <p className="text-muted-foreground">Manage the content of the gallery.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Section Header</CardTitle>
                    <CardDescription>Update the title for the gallery section.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="textContent.title"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Main Title</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., GALLERY" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="textContent.subtitle"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Subtitle</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Explore our latest work." {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Main Gallery (9 Fixed Items)</CardTitle>
                    <CardDescription>Manage the 9 fixed images/videos for the main gallery. Replace items by uploading a new file.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {mainMediaFields.map((item, index) => renderMediaItemForm('mainMedia', index, item, watchMainMedia))}
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Additional Gallery</CardTitle>
                        <CardDescription>Add, remove, and edit extra images and videos for your gallery.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" onClick={handleAddItem}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Media
                        </Button>
                         <Button type="submit" disabled={isPending}>
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save All Changes
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {additionalMediaFields.map((item, index) => renderMediaItemForm('additionalMedia', index, item, watchAdditionalMedia))}
                    </div>
                    {additionalMediaFields.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">No additional media added yet.</p>
                    )}
                </CardContent>
            </Card>
      </form>
    </Form>
  );
}

    