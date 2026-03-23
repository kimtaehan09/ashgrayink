
'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import { storage } from '@/lib/firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Edit, Save, PlusCircle, Trash2, Smartphone, Monitor } from 'lucide-react';
import { saveAboutData } from './actions';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { AboutSectionData } from './actions';
import { useAuth } from '@/contexts/auth-context';


export interface Stat {
  value: string;
  label: string;
}

const aboutContentSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().min(1, 'Description is required.'),
});

const statSchema = z.object({
  value: z.string().min(1, 'Value is required.'),
  label: z.string().min(1, 'Label is required.'),
});

const formSchema = z.object({
  desktop: aboutContentSchema,
  mobile: aboutContentSchema,
  stats: z.array(statSchema),
});

type AboutFormValues = z.infer<typeof formSchema>;

interface AboutFormProps {
  initialData: AboutSectionData;
}

export default function AboutForm({ initialData }: AboutFormProps) {
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(initialData.imageUrl);
  const [newImageFile, setNewImageFile] = useState<{ dataUrl: string; format: string } | null>(null);
  const { user } = useAuth();

  const form = useForm<AboutFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      desktop: initialData.desktop,
      mobile: initialData.mobile,
      stats: initialData.stats || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'stats',
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
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
        setImagePreview(dataUrl);
        setNewImageFile({ dataUrl, format: file.type.split('/')[1] || 'png' });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (values: AboutFormValues) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to save changes.' });
      return;
    }

    startTransition(async () => {
      const idToken = await user.getIdToken();
      let imageUrl = initialData.imageUrl;

      if (newImageFile) {
        try {
          const imageRef = ref(storage, `about/about-image.${newImageFile.format}`);
          const uploadResult = await uploadString(imageRef, newImageFile.dataUrl, 'data_url');
          imageUrl = await getDownloadURL(uploadResult.ref);
        } catch (uploadError: any) {
           toast({
            variant: 'destructive',
            title: 'Image Upload Failed',
            description: uploadError.message || 'There was a problem with your request.',
          });
          return;
        }
      }
      
      const finalData: AboutSectionData = {
        ...values,
        imageUrl,
      };

      const result = await saveAboutData(finalData, idToken);
      if (result.success) {
        toast({
          title: 'Success!',
          description: 'About section has been updated.',
        });
        setNewImageFile(null);
        form.reset(values);
        setImagePreview(imageUrl); // Update preview to saved image
      } else {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: result.error || 'There was a problem with your request.',
        });
      }
    });
  };

  const renderContentForm = (device: 'desktop' | 'mobile') => (
     <CardContent className="space-y-6">
        <FormField
        control={form.control}
        name={`${device}.title`}
        render={({ field }) => (
            <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
                <Input placeholder="Our Story" {...field} />
            </FormControl>
            <FormMessage />
            </FormItem>
        )}
        />
        <FormField
        control={form.control}
        name={`${device}.description`}
        render={({ field }) => (
            <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
                <Textarea
                placeholder="We believe that every tattoo tells a story..."
                className="min-h-[250px]"
                {...field}
                />
            </FormControl>
            <FormMessage />
            </FormItem>
        )}
        />
    </CardContent>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center gap-4 mb-8">
            <Edit className="h-8 w-8 text-primary" />
            <div>
                <h1 className="text-2xl font-bold">Edit About Section</h1>
                <p className="text-muted-foreground">Update the title, paragraphs, image, and stats in the 'Our Story' section.</p>
            </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Section Content</CardTitle>
                    <CardDescription>Update the title and description for this section.</CardDescription>
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

            <Collapsible>
              <Card>
                <CollapsibleTrigger className="w-full text-left">
                  <CardHeader className="relative">
                      <CardTitle>Stats</CardTitle>
                      <CardDescription>Manage the statistics displayed in this section.</CardDescription>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                      {fields.map((field, index) => (
                        <div key={field.id} className="flex items-end gap-2 p-2 border rounded-md">
                          <FormField
                              control={form.control}
                              name={`stats.${index}.value`}
                              render={({ field }) => (
                                  <FormItem className="flex-1">
                                  <FormLabel>Value</FormLabel>
                                  <FormControl>
                                      <Input placeholder="e.g., 10+" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                  </FormItem>
                              )}
                          />
                          <FormField
                              control={form.control}
                              name={`stats.${index}.label`}
                              render={({ field }) => (
                                  <FormItem className="flex-1">
                                  <FormLabel>Label</FormLabel>
                                  <FormControl>
                                      <Input placeholder="e.g., Years of Excellence" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                  </FormItem>
                              )}
                          />
                          <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                              <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button type="button" variant="outline" onClick={() => append({ value: '', label: '' })}>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add Stat
                      </Button>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>
          
          <div>
            <Collapsible>
              <Card>
                  <CollapsibleTrigger className="w-full text-left">
                    <CardHeader className="relative">
                        <CardTitle>Section Image</CardTitle>
                        <CardDescription>Upload a new image for the section.</CardDescription>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-4">
                        {imagePreview && (
                          <div className="relative w-full aspect-video rounded-md overflow-hidden">
                            <Image src={imagePreview} alt="About section preview" fill className="object-cover" />
                          </div>
                        )}
                        <Input type="file" accept="image/png, image/jpeg, image/gif" onChange={handleImageChange} />
                    </CardContent>
                  </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>
        </div>
        
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </form>
    </Form>
  );
}
