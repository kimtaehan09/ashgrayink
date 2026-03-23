
'use client';

import { useTransition } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, HelpCircle, Save, PlusCircle, Trash2, Monitor, Smartphone } from 'lucide-react';
import { saveFaqData } from './actions';
import { formSchema, type FaqSectionData } from './types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';


interface FaqFormProps {
  initialData: FaqSectionData;
}

export default function FaqForm({ initialData }: FaqFormProps) {
  const [isPending, startTransition] = useTransition();
  const { user } = useAuth();

  const form = useForm<FaqSectionData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || { desktop: { title: '', subtitle: '' }, mobile: { title: '', subtitle: '' }, items: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const onSubmit = (values: FaqSectionData) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to save changes.' });
      return;
    }
    startTransition(async () => {
      const idToken = await user.getIdToken();
      const result = await saveFaqData(values, idToken);
      if (result.success) {
        toast({
          title: 'Success!',
          description: 'FAQ section has been updated.',
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
    <CardContent className="pt-6">
        <FormField
            control={form.control}
            name={`${device}.title`}
            render={({ field }) => (
                <FormItem className="mb-6">
                <FormLabel>Title</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., FAQ" {...field} />
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
                    <Input placeholder="e.g., Frequently Asked Questions" {...field} />
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
            <HelpCircle className="h-8 w-8 text-primary" />
            <div>
                <h1 className="text-2xl font-bold">Edit FAQ Section</h1>
                <p className="text-muted-foreground">Update the title, subtitle, and all question/answer pairs.</p>
            </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Section Header</CardTitle>
                <CardDescription>The main title and subtitle for the FAQ section.</CardDescription>
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
        
        <Collapsible>
          <Card>
            <CollapsibleTrigger className="w-full text-left">
              <div className="relative p-6">
                  <CardTitle>Questions &amp; Answers</CardTitle>
                  <CardDescription>Manage the FAQ items. You can add, remove, and edit them here.</CardDescription>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <CardContent className="space-y-4 pt-0">
                    {fields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-4 p-4 border rounded-md bg-muted/20">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                            <FormField
                                control={form.control}
                                name={`items.${index}.question`}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Question</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Does it hurt?" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`items.${index}.answer`}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Answer</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="The answer to the question..." className="min-h-[100px]" {...field} />
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
                    <Button type="button" variant="outline" onClick={() => append({ id: `faq-${uuidv4()}`, question: '', answer: '' })}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add FAQ Item
                    </Button>
                </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
        
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
