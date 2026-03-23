
'use client';

import { useState, useTransition, useEffect } from 'react';
import Image from 'next/image';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '@/lib/firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Users, Save, PlusCircle, Trash2, Monitor, Smartphone } from 'lucide-react';
import { saveArtistsData, saveArtistContentData } from './actions';
import type { ArtistContentData } from './actions';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';


export interface Artist {
  id: string; // Keep a unique ID for each artist for stable list rendering
  name: string;
  styles: string;
  description: string;
  galleryUrl: string;
  image: {
    src: string;
    alt: string;
    hint: string;
  };
}

const artistSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required.'),
  styles: z.string().min(1, 'Styles are required.'),
  description: z.string().min(1, 'Description is required.'),
  galleryUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  image: z.object({
    src: z.string().min(1, 'Image URL is required.'),
    alt: z.string(),
    hint: z.string(),
  })
});

const artistsFormSchema = z.object({
  artists: z.array(artistSchema),
});

const contentTextSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  subtitle: z.string(),
});

const contentFormSchema = z.object({
    desktop: contentTextSchema,
    mobile: contentTextSchema,
});

type ArtistsFormValues = z.infer<typeof artistsFormSchema>;
type ContentFormValues = z.infer<typeof contentFormSchema>;

interface ArtistsFormProps {
  initialContentData: ArtistContentData;
  initialArtistsData: Artist[];
}

interface NewImageFile {
    index: number;
    dataUrl: string;
    format: string;
}

export default function ArtistsForm({ initialContentData, initialArtistsData }: ArtistsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<NewImageFile[]>([]);
  const [activeTab, setActiveTab] = useState('');
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  const { user } = useAuth();

  const artistsForm = useForm<ArtistsFormValues>({
    resolver: zodResolver(artistsFormSchema),
  });

  const contentForm = useForm<ContentFormValues>({
      resolver: zodResolver(contentFormSchema),
      defaultValues: initialContentData,
  });

  const { fields, append, remove } = useFieldArray({
    control: artistsForm.control,
    name: 'artists',
    keyName: 'id',
  });

  useEffect(() => {
    const artistsWithClientIds = initialArtistsData.map(artist => ({
        ...artist,
        id: artist.id || uuidv4(),
        galleryUrl: artist.galleryUrl || '',
    }));
    artistsForm.reset({ artists: artistsWithClientIds });
    setImagePreviews(artistsWithClientIds.map(a => a.image.src));
    if (artistsWithClientIds.length > 0) {
        setActiveTab(artistsWithClientIds[0].id);
    }
    setIsFormInitialized(true);
  }, [initialArtistsData, artistsForm]);

  useEffect(() => {
    // Ensure there's a valid active tab if there are artists
    if (fields.length > 0 && !fields.find(f => f.id === activeTab)) {
        setActiveTab(fields[0].id);
    } else if (fields.length === 0) {
        setActiveTab('');
    }
  }, [fields, activeTab]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Image size cannot exceed 4MB.',
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        
        const newPreviews = [...imagePreviews];
        newPreviews[index] = dataUrl;
        setImagePreviews(newPreviews);
        
        const newFile = { index, dataUrl, format: file.type.split('/')[1] || 'png' };
        setNewImageFiles(prev => [...prev.filter(f => f.index !== index), newFile]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveArtist = (index: number) => {
    const removedArtistId = fields[index].id;
    remove(index);

    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
    setNewImageFiles(newImageFiles.filter(f => f.index !== index).map(f => f.index > index ? { ...f, index: f.index - 1 } : f));
  
    if (activeTab === removedArtistId) {
        const newActiveIndex = index > 0 ? index - 1 : 0;
        if (fields.length > 1) {
          setActiveTab(fields[newActiveIndex].id);
        } else {
          setActiveTab('');
        }
    }
  };
  
  const handleAddArtist = () => {
    const newArtistId = uuidv4();
    const newArtistData: Artist = {
        id: newArtistId,
        name: 'New Artist',
        styles: 'Specialty Styles',
        description: 'Artist description.',
        galleryUrl: '',
        image: { src: 'https://picsum.photos/400/600', alt: 'New Artist', hint: 'tattoo artist' }
    };
    append(newArtistData, { shouldFocus: false });
    setImagePreviews([...imagePreviews, 'https://picsum.photos/400/600']);
    setActiveTab(newArtistId);
  }

  const onSubmit = async (contentValues: ContentFormValues, artistValues: ArtistsFormValues) => {
     if (!user) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to save changes.' });
      return;
    }
    startTransition(async () => {
      const idToken = await user.getIdToken();
      let artistsToSave = [...artistValues.artists];

      try {
        for (const newImage of newImageFiles) {
            const artist = artistsToSave[newImage.index];
            if (artist) {
                const imageRef = ref(storage, `artists/${artist.id}.${newImage.format}`);
                const uploadResult = await uploadString(imageRef, newImage.dataUrl, 'data_url');
                const downloadUrl = await getDownloadURL(uploadResult.ref);
                artistsToSave[newImage.index].image.src = downloadUrl;
            }
        }
      } catch (uploadError: any) {
         toast({
          variant: 'destructive',
          title: 'Image Upload Failed',
          description: uploadError.message || 'There was a problem with your request.',
        });
        return;
      }

      const [contentResult, artistsResult] = await Promise.all([
        saveArtistContentData(contentValues, idToken),
        saveArtistsData(artistsToSave, idToken)
      ]);

      if (contentResult.success && artistsResult.success) {
        toast({
          title: 'Success!',
          description: 'Artists section has been updated.',
        });
        setNewImageFiles([]);
        contentForm.reset(contentValues);
        artistsForm.reset({ artists: artistsToSave });
        setImagePreviews(artistsToSave.map(a => a.image.src));
      } else {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: contentResult.error || artistsResult.error || 'There was a problem with your request.',
        });
      }
    });
  };

  const handleFormSubmit = () => {
      Promise.all([contentForm.trigger(), artistsForm.trigger()]).then(valid => {
          if (valid.every(Boolean)) {
              onSubmit(contentForm.getValues(), artistsForm.getValues());
          } else {
              toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Please check all fields and try again.',
              })
          }
      });
  };

  const renderContentForm = (device: 'desktop' | 'mobile') => (
    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
        <FormField
            control={contentForm.control}
            name={`${device}.title`}
            render={({ field }) => (
                <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., ARTISTS" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
        <FormField
            control={contentForm.control}
            name={`${device}.subtitle`}
            render={({ field }) => (
                <FormItem>
                <FormLabel>Subtitle</FormLabel>
                <FormControl>
                    <Textarea placeholder="e.g., Meet our world-renowned team..." {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
    </CardContent>
  );
  
  if (!isFormInitialized) {
      return (
          <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Users className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-2xl font-bold">Edit Artists Section</h1>
                    <p className="text-muted-foreground">Manage your studio's artists and section content.</p>
                </div>
            </div>
            <Loader2 className="mx-auto h-8 w-8 animate-spin" />
            <p className="text-center text-muted-foreground">Loading form...</p>
        </div>
      );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
            <Users className="h-8 w-8 text-primary" />
            <div>
                <h1 className="text-2xl font-bold">Edit Artists Section</h1>
                <p className="text-muted-foreground">Manage your studio's artists and section content.</p>
            </div>
        </div>
      </div>

      <Form {...contentForm}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Section Header</CardTitle>
                    <CardDescription>Update the title and subtitle for the artists section.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Tabs defaultValue="desktop">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="desktop"><Monitor className="mr-2 h-4 w-4" /> Desktop</TabsTrigger>
                            <TabsTrigger value="mobile"><Smartphone className="mr-2 h-4 w-4" /> Mobile</TabsTrigger>
                        </TabsList>
                        <TabsContent value="desktop">
                            {renderContentForm('desktop')}
                        </TabsContent>
                        <TabsContent value="mobile">
                             {renderContentForm('mobile')}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </form>
      </Form>
      
      <Form {...artistsForm}>
        <form onSubmit={(e) => { e.preventDefault(); handleFormSubmit(); }}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex items-center gap-4">
                    <TabsList>
                        {fields.map((field, index) => (
                        <TabsTrigger key={field.id} value={field.id}>
                            {artistsForm.watch(`artists.${index}.name`) || `Artist ${index + 1}`}
                        </TabsTrigger>
                        ))}
                    </TabsList>
                    <Button type="button" variant="outline" onClick={handleAddArtist}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Artist
                    </Button>
                </div>

                {fields.map((field, index) => (
                <TabsContent key={field.id} value={field.id} forceMount className={activeTab === field.id ? 'block' : 'hidden'}>
                    <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>Edit Artist: {artistsForm.watch(`artists.${index}.name`)}</CardTitle>
                                <CardDescription>Update the details for this artist.</CardDescription>
                            </div>
                            <Button 
                                type="button" 
                                variant="destructive" 
                                size="icon" 
                                onClick={() => handleRemoveArtist(index)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
                        <div className="space-y-4">
                            {imagePreviews[index] && (
                                <div className="relative w-full aspect-square rounded-md overflow-hidden border">
                                    <Image src={imagePreviews[index]!} alt="Artist preview" fill className="object-cover" />
                                </div>
                            )}
                            <FormField
                                control={artistsForm.control}
                                name={`artists.${index}.image.src`}
                                render={() => (
                                <FormItem>
                                    <FormLabel>Image</FormLabel>
                                    <FormControl>
                                    <Input type="file" accept="image/png, image/jpeg, image/gif" onChange={(e) => handleImageChange(e, index)} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                        <div className="lg:col-span-2 space-y-4">
                            <FormField
                                control={artistsForm.control}
                                name={`artists.${index}.name`}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Olivia" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={artistsForm.control}
                                name={`artists.${index}.styles`}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Styles</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Fine-line & Realism" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={artistsForm.control}
                                name={`artists.${index}.description`}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="e.g., Master of fine-line and realism..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={artistsForm.control}
                                name={`artists.${index}.galleryUrl`}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Gallery URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://instagram.com/artist" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                    </Card>
                </TabsContent>
                ))}
            </Tabs>
        </form>
      </Form>
      
      <Button type="button" onClick={handleFormSubmit} disabled={isPending}>
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Save All Changes
      </Button>
    </div>
  );
}

    