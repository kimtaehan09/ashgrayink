
'use client';

import { useTransition } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MessageSquare, Save, PlusCircle, Trash2, Monitor, Smartphone, Link as LinkIcon, Instagram, Facebook } from 'lucide-react';
import { saveFooterData } from './actions';
import type { FooterData } from './actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';

const socialLinkSchema = z.object({
    id: z.string(),
    platform: z.enum(['instagram', 'facebook', 'x', 'youtube']),
    url: z.string().min(1, 'URL is required.'),
});

const linkSchema = z.object({
    id: z.string(),
    label: z.string().min(1, 'Label is required.'),
    url: z.string().min(1, 'URL is required.'),
});

const footerContentSchema = z.object({
  copyrightText: z.string().min(1, 'Copyright text is required.'),
  disclaimer: z.string().min(1, 'Disclaimer is required.'),
});

const formSchema = z.object({
  desktop: footerContentSchema,
  mobile: footerContentSchema,
  links: z.array(linkSchema.omit({ id: true })),
  socialLinks: z.array(socialLinkSchema.omit({id: true}))
});

type FooterFormValues = z.infer<typeof formSchema>;


interface FooterFormProps {
  initialData: FooterData;
}

const socialIcons = {
    instagram: <Instagram className="h-5 w-5" />,
    facebook: <Facebook className="h-5 w-5" />,
    x: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 16 16"><path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-2.6 13.012h1.36L4.323 2.145H2.865l7.136 11.617Z"/></svg>,
    youtube: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 16 16"><path d="M8.051 1.999a.6.6 0 0 1 .59.022l4.994 2.88a.6.6 0 0 1 .305.518v5.15a.6.6 0 0 1-.305.518l-4.994 2.882a.6.6 0 0 1-.59.022a.6.6 0 0 1-.299-.518V2.517a.6.6 0 0 1 .3-.518Z"/></svg>
};

export default function FooterForm({ initialData }: FooterFormProps) {
  const [isPending, startTransition] = useTransition();
  const { user } = useAuth();

  const form = useForm<FooterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        ...initialData,
        links: initialData.links.map(link => ({ ...link, id: uuidv4() })),
        socialLinks: initialData.socialLinks.map(link => ({ ...link, id: uuidv4() }))
    }
  });

  const { fields: linkFields, append: appendLink, remove: removeLink } = useFieldArray({
    control: form.control,
    name: 'links',
  });

  const { fields: socialLinkFields, append: appendSocialLink, remove: removeSocialLink } = useFieldArray({
    control: form.control,
    name: 'socialLinks',
  });

  const onSubmit = (values: FooterFormValues) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to save changes.' });
      return;
    }
    startTransition(async () => {
      const idToken = await user.getIdToken();
      const result = await saveFooterData(values, idToken);
      if (result.success) {
        toast({
          title: 'Success!',
          description: 'Footer section has been updated.',
        });
        form.reset(values);
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
    <CardContent className="space-y-6 pt-6">
        <FormField
            control={form.control}
            name={`${device}.copyrightText`}
            render={({ field }) => (
            <FormItem>
                <FormLabel>Copyright Text</FormLabel>
                <FormControl>
                <Input placeholder="© 2024 Ashgray Ink. All rights reserved." {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        <FormField
            control={form.control}
            name={`${device}.disclaimer`}
            render={({ field }) => (
            <FormItem>
                <FormLabel>Disclaimer Text</FormLabel>
                <FormControl>
                <Textarea
                    placeholder="Professional tattoo services..."
                    className="min-h-[100px]"
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
        <div className="flex items-center gap-4 mb-4">
            <MessageSquare className="h-8 w-8 text-primary" />
            <div>
                <h1 className="text-2xl font-bold">Edit Footer Section</h1>
                <p className="text-muted-foreground">Update the content of your website footer.</p>
            </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>General Content</CardTitle>
            <CardDescription>Update the copyright and disclaimer text.</CardDescription>
          </CardHeader>
          <CardContent>
             <Tabs defaultValue="desktop">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="desktop"><Monitor className="mr-2 h-4 w-4" /> Desktop</TabsTrigger>
                    <TabsTrigger value="mobile"><Smartphone className="mr-2 h-4 w-4" /> Mobile</TabsTrigger>
                </TabsList>
                <TabsContent value="desktop" className="mt-0">
                    {renderContentForm('desktop')}
                </TabsContent>
                <TabsContent value="mobile" className="mt-0">
                    {renderContentForm('mobile')}
                </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Footer Links</CardTitle>
                    <CardDescription>Manage the links displayed in the footer. These are the same for desktop and mobile.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {linkFields.map((field, index) => (
                        <div key={field.id} className="flex items-end gap-2 p-2 border rounded-md">
                            <FormField
                                control={form.control}
                                name={`links.${index}.label`}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                    <FormLabel>Label</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Privacy Policy" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`links.${index}.url`}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                    <FormLabel>URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., /privacy" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="button" variant="destructive" size="icon" onClick={() => removeLink(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" onClick={() => appendLink({ id: uuidv4(), label: '', url: '' })}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Link
                    </Button>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Social Media Links</CardTitle>
                    <CardDescription>Manage the social media links. These are used in the header and footer.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {socialLinkFields.map((field, index) => (
                        <div key={field.id} className="flex items-end gap-2 p-2 border rounded-md">
                             <FormField
                                control={form.control}
                                name={`socialLinks.${index}.platform`}
                                render={({ field }) => (
                                <FormItem className="w-1/3">
                                    <FormLabel>Platform</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.entries(socialIcons).map(([platform, icon]) => (
                                            <SelectItem key={platform} value={platform}>
                                                <div className="flex items-center gap-2">
                                                    {icon}
                                                    <span className="capitalize">{platform}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`socialLinks.${index}.url`}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                    <FormLabel>URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://instagram.com/..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="button" variant="destructive" size="icon" onClick={() => removeSocialLink(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" onClick={() => appendSocialLink({ id: uuidv4(), platform: 'instagram', url: '' })}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Social Link
                    </Button>
                </CardContent>
            </Card>
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
