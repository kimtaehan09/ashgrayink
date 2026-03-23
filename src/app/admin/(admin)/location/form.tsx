
'use client';

import { useTransition } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription as UiFormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MapPin, Save, PlusCircle, Trash2, Monitor, Smartphone } from 'lucide-react';
import { saveLocationData } from './actions';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { formSchema, type LocationSectionData } from './types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';


interface LocationFormProps {
  initialData: LocationSectionData;
}

export default function LocationForm({ initialData }: LocationFormProps) {
  const [isPending, startTransition] = useTransition();
  const { user } = useAuth();

  const form = useForm<LocationSectionData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {},
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = event.clipboardData.getData('text');
    const srcRegex = /src="([^"]+)"/;
    const match = pastedText.match(srcRegex);
    if (match && match[1]) {
      event.preventDefault();
      form.setValue('mapEmbedUrl', match[1], { shouldValidate: true });
      toast({
          title: 'URL Extracted!',
          description: 'The map embed URL has been automatically extracted from the pasted code.',
      });
    }
  };
  
  const onSubmit = (values: LocationSectionData) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to save changes.' });
      return;
    }
    startTransition(async () => {
      const idToken = await user.getIdToken();
      const result = await saveLocationData(values, idToken);
      if (result.success) {
        toast({
          title: 'Success!',
          description: 'Location section has been updated.',
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
            name={`${device}.title`}
            render={({ field }) => (
                <FormItem>
                <FormLabel>Main Title</FormLabel>
                <FormControl>
                    <Input placeholder="VISIT OUR STUDIO" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
        <FormField
            control={form.control}
            name={`${device}.subtitle`}
            render={({ field }) => (
                <FormItem>
                <FormLabel>Subtitle</FormLabel>
                <FormControl>
                    <Textarea placeholder="Visit us at our flagship studio..." {...field} />
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
            <MapPin className="h-8 w-8 text-primary" />
            <div>
                <h1 className="text-2xl font-bold">Edit Location Section</h1>
                <p className="text-muted-foreground">Update the content for the "Visit Our Studio" section.</p>
            </div>
        </div>

        <div className="space-y-6">
            <Card>
              <CardHeader>
                  <CardTitle>Header & Map</CardTitle>
                  <CardDescription>Update the titles and the map URL.</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="desktop" className="mb-6">
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
                <FormField
                  control={form.control}
                  name="mapEmbedUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Google Maps Embed URL</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste the <iframe> code from Google Maps here..."
                          {...field}
                          onPaste={handlePaste}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <UiFormDescription>
                        From Google Maps, find a location, click 'Share', then 'Embed a map'. Copy the `&lt;iframe...&gt;` code and paste it here. The URL will be extracted automatically.
                      </UiFormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Collapsible>
              <Card>
                <CollapsibleTrigger className="w-full text-left">
                   <CardHeader className="relative">
                        <CardTitle>Text Content Blocks</CardTitle>
                        <CardDescription>Manage the text information blocks. These are the same for desktop and mobile.</CardDescription>
                    </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                      {fields.map((field, index) => (
                        <div key={field.id} className="flex items-start gap-4 p-4 border rounded-md relative">
                          <div className="flex-1 space-y-2">
                            <FormField
                                control={form.control}
                                name={`items.${index}.title`}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., ADDRESS" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`items.${index}.content`}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Content</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Enter content here. Use Shift+Enter for line breaks." className="min-h-[100px]" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                          </div>
                          <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} className="mt-7">
                              <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button type="button" variant="outline" onClick={() => append({ title: '', content: '' })}>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add Content Block
                      </Button>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
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
