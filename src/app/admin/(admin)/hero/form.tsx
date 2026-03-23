
'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import { storage } from '@/lib/firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, Home, Save, Smartphone, Monitor } from 'lucide-react';
import { saveHeroData } from './actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { HeroSectionData } from './actions';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useAuth } from '@/contexts/auth-context';


const heroContentSchema = z.object({
  subtitle: z.string(),
  buttonText: z.string().min(1, 'Button text is required.'),
});

const formSchema = z.object({
  desktop: heroContentSchema,
  mobile: heroContentSchema,
  desktopBackgroundType: z.enum(['image', 'video']),
  mobileBackgroundType: z.enum(['image', 'video']),
  imageScale: z.number().min(50).max(150),
});

type HeroFormValues = z.infer<typeof formSchema>;

interface HeroFormProps {
  initialData: HeroSectionData;
}

export default function HeroForm({ initialData }: HeroFormProps) {
  const [isPending, startTransition] = useTransition();
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData.logoUrl);
  const [newLogoFile, setNewLogoFile] = useState<{ dataUrl: string; format: string } | null>(null);
  
  const [imagePreview, setImagePreview] = useState<string | null>(initialData.imageUrl);
  const [newImageFile, setNewImageFile] = useState<{ dataUrl: string; format: string } | null>(null);

  const [videoPreview, setVideoPreview] = useState<string | null>(initialData.videoUrl);
  const [newVideoFile, setNewVideoFile] = useState<{ dataUrl: string; format: string } | null>(null);
  const { user } = useAuth();

  const form = useForm<HeroFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      desktop: {
        subtitle: initialData.desktop.subtitle,
        buttonText: initialData.desktop.buttonText,
      },
      mobile: {
        subtitle: initialData.mobile.subtitle,
        buttonText: initialData.mobile.buttonText,
      },
      desktopBackgroundType: initialData.desktopBackgroundType || 'video',
      mobileBackgroundType: initialData.mobileBackgroundType || 'video',
      imageScale: initialData.imageScale || 100,
    },
  });

  const imageScale = form.watch('imageScale');
  const desktopBgType = form.watch('desktopBackgroundType');
  const mobileBgType = form.watch('mobileBackgroundType');

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) { // 1MB limit for logo
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Logo size cannot exceed 1MB.',
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setLogoPreview(dataUrl);
        setNewLogoFile({ dataUrl, format: file.type.split('/')[1] || 'png' });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Image size cannot exceed 50MB.',
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

  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) { // 100MB video limit
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Video size cannot exceed 100MB.',
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setVideoPreview(dataUrl);
        setNewVideoFile({ dataUrl, format: file.type.split('/')[1] || 'mp4' });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (values: HeroFormValues) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to save changes.' });
      return;
    }
    startTransition(async () => {
      const idToken = await user.getIdToken();
      
      const dataToSave: HeroSectionData = {
        ...initialData,
        ...values,
      };

      try {
        if (newLogoFile) {
            const logoRef = ref(storage, `hero/hero-logo.${newLogoFile.format}`);
            const uploadResult = await uploadString(logoRef, newLogoFile.dataUrl, 'data_url');
            dataToSave.logoUrl = await getDownloadURL(uploadResult.ref);
        }

        if (newImageFile) {
            const imageRef = ref(storage, `hero/hero-bg.${newImageFile.format}`);
            const uploadResult = await uploadString(imageRef, newImageFile.dataUrl, 'data_url');
            dataToSave.imageUrl = await getDownloadURL(uploadResult.ref);
        }
        
        if (newVideoFile) {
            const videoRef = ref(storage, `hero/hero-bg-video.${newVideoFile.format}`);
            const uploadResult = await uploadString(videoRef, newVideoFile.dataUrl, 'data_url');
            dataToSave.videoUrl = await getDownloadURL(uploadResult.ref);
        }
      } catch (uploadError: any) {
        console.error("File upload failed:", uploadError);
        toast({
          variant: 'destructive',
          title: 'File Upload Failed',
          description: uploadError.message || 'Could not upload files to storage. Check storage rules and network.',
        });
        return;
      }

      // @ts-ignore - removing old property
      delete dataToSave.backgroundType;

      const result = await saveHeroData(dataToSave, idToken);
      if (result.success) {
        toast({
          title: 'Success!',
          description: 'Hero section has been updated.',
        });
        setNewLogoFile(null);
        setNewImageFile(null);
        setNewVideoFile(null);
        form.reset(values);
        // Manually update previews to reflect saved state
        setLogoPreview(dataToSave.logoUrl);
        setImagePreview(dataToSave.imageUrl);
        setVideoPreview(dataToSave.videoUrl);
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
      <div className="space-y-6">
          <FormField
            control={form.control}
            name={`${device}.subtitle`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subtitle</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Your Story, Inked."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name={`${device}.buttonText`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Button Text</FormLabel>
                <FormControl>
                  <Input placeholder="MAKE AN APPOINTMENT" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
      </div>
  );

  const renderBackgroundForm = (device: 'desktop' | 'mobile') => {
      const bgType = device === 'desktop' ? desktopBgType : mobileBgType;
      const fieldName = device === 'desktop' ? 'desktopBackgroundType' : 'mobileBackgroundType';

      return (
        <div className="space-y-4">
            <FormField
            control={form.control}
            name={fieldName}
            render={({ field }) => (
                <FormItem className="space-y-3">
                <FormLabel>Background Type</FormLabel>
                <FormControl>
                    <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-4"
                    >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                        <RadioGroupItem value="image" />
                        </FormControl>
                        <FormLabel className="font-normal">Image</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                        <RadioGroupItem value="video" />
                        </FormControl>
                        <FormLabel className="font-normal">Video</FormLabel>
                    </FormItem>
                    </RadioGroup>
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />

            {bgType === 'image' && (
            <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium">Background Image</h3>
                {imagePreview && (
                <div className="relative w-full aspect-video rounded-md overflow-hidden">
                    <Image src={imagePreview} alt="Background preview" fill className="object-cover" />
                </div>
                )}
                <Input type="file" accept="image/png, image/jpeg, image/gif" onChange={handleImageChange} />
                <FormField
                    control={form.control}
                    name="imageScale"
                    render={({ field: { value, onChange } }) => (
                        <FormItem>
                            <FormLabel>Background Image Zoom: {imageScale}%</FormLabel>
                            <FormControl>
                                <Slider
                                    min={50}
                                    max={150}
                                    step={1}
                                    value={[value]}
                                    onValueChange={(vals) => onChange(vals[0])}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                <p className="text-xs text-muted-foreground">Recommended: High resolution. Max 50MB.</p>
            </div>
            )}

            {bgType === 'video' && (
            <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium">Background Video</h3>
                {videoPreview && (
                <div className="relative w-full aspect-video rounded-md overflow-hidden bg-black">
                    <video key={videoPreview} src={videoPreview} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                </div>
                )}
                <Input type="file" accept="video/mp4,video/webm" onChange={handleVideoChange} />
                <p className="text-xs text-muted-foreground">Recommended: MP4 or WebM format. Max 100MB.</p>
            </div>
            )}
        </div>
      )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center gap-4 mb-8">
            <Home className="h-8 w-8 text-primary" />
            <div>
                <h1 className="text-2xl font-bold">Edit Hero Section</h1>
                <p className="text-muted-foreground">Update the content, logo, and background for the hero section.</p>
            </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Section Content</CardTitle>
                    <CardDescription>Update the content for desktop and mobile versions separately.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="desktop">
                      <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="desktop"><Monitor className="mr-2 h-4 w-4" /> Desktop</TabsTrigger>
                          <TabsTrigger value="mobile"><Smartphone className="mr-2 h-4 w-4" /> Mobile</TabsTrigger>
                      </TabsList>
                      <TabsContent value="desktop">
                          <Card className="border-0 shadow-none">
                              <CardContent className="p-6">
                                  {renderContentForm('desktop')}
                              </CardContent>
                          </Card>
                      </TabsContent>
                      <TabsContent value="mobile">
                          <Card className="border-0 shadow-none">
                              <CardContent className="p-6">
                                  {renderContentForm('mobile')}
                              </CardContent>
                          </Card>
                      </TabsContent>
                  </Tabs>
                </CardContent>
            </Card>
          </div>
          
          <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Logo Image</CardTitle>
                    <CardDescription>Upload a new logo image. Best with a transparent background.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {logoPreview && (
                      <div className="relative w-48 h-48 rounded-md overflow-hidden bg-muted p-2">
                        <Image src={logoPreview} alt="Logo preview" fill className="object-contain" />
                      </div>
                    )}
                    <Input type="file" accept="image/png, image/jpeg, image/gif, image/svg+xml" onChange={handleLogoChange} />
                    <p className="text-xs text-muted-foreground">Recommended: Transparent PNG or SVG. Max 1MB.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Background Settings</CardTitle>
                    <CardDescription>Choose the background for desktop and mobile devices.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="desktop">
                      <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="desktop"><Monitor className="mr-2 h-4 w-4" /> Desktop</TabsTrigger>
                          <TabsTrigger value="mobile"><Smartphone className="mr-2 h-4 w-4" /> Mobile</TabsTrigger>
                      </TabsList>
                      <TabsContent value="desktop">
                        <Card className="border-0 shadow-none">
                            <CardContent className="p-6">
                                {renderBackgroundForm('desktop')}
                            </CardContent>
                        </Card>
                      </TabsContent>
                      <TabsContent value="mobile">
                          <Card className="border-0 shadow-none">
                            <CardContent className="p-6">
                                {renderBackgroundForm('mobile')}
                            </CardContent>
                          </Card>
                      </TabsContent>
                  </Tabs>
                </CardContent>
            </Card>
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
