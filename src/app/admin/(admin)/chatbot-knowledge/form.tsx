
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
import { Loader2, BrainCircuit, Save, PlusCircle, Trash2 } from 'lucide-react';
import { saveChatbotKnowledgeData } from './actions';
import { formSchema, type KnowledgeSectionData, type KnowledgeItem } from './types';
import { useAuth } from '@/contexts/auth-context';

interface KnowledgeFormProps {
  initialData: KnowledgeItem[];
}

export default function KnowledgeForm({ initialData }: KnowledgeFormProps) {
  const [isPending, startTransition] = useTransition();
  const { user } = useAuth();

  const form = useForm<KnowledgeSectionData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        items: initialData || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const onSubmit = (values: KnowledgeSectionData) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to save changes.' });
      return;
    }
    startTransition(async () => {
      const idToken = await user.getIdToken();
      const result = await saveChatbotKnowledgeData(values.items, idToken);
      if (result.success) {
        toast({
          title: 'Success!',
          description: 'Chatbot knowledge base has been updated.',
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center gap-4 mb-4">
            <BrainCircuit className="h-8 w-8 text-primary" />
            <div>
                <h1 className="text-2xl font-bold">Edit Chatbot Knowledge</h1>
                <p className="text-muted-foreground">Add, edit, or remove questions and answers to train your chatbot.</p>
            </div>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>Knowledge Base</CardTitle>
                <CardDescription>This is the extra information the chatbot will use to answer questions not covered by the website's content.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-4 p-4 border rounded-md bg-muted/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                        <FormField
                            control={form.control}
                            name={`items.${index}.question`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Anticipated Question</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Do you offer vegan ink?" {...field} />
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
                                <FormLabel>Chatbot's Answer</FormLabel>
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
                <Button type="button" variant="outline" onClick={() => append({ id: `knowledge-${uuidv4()}`, question: '', answer: '' })}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Knowledge Item
                </Button>
            </CardContent>
        </Card>
        
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Knowledge Base
        </Button>
      </form>
    </Form>
  );
}
