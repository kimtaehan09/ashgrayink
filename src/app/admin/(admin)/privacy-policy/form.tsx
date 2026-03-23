
'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Shield, Save } from 'lucide-react';
import { savePrivacyPolicyData } from './actions';
import type { PrivacyPolicyData } from './actions';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  content: z.string().min(1, 'Content is required.'),
});

interface PrivacyPolicyFormProps {
  initialData: PrivacyPolicyData;
}

export default function PrivacyPolicyForm({ initialData }: PrivacyPolicyFormProps) {
  const [isPending, startTransition] = useTransition();
  const { user } = useAuth();

  const form = useForm<PrivacyPolicyData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });
  
  const onSubmit = (values: PrivacyPolicyData) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to save changes.' });
      return;
    }
    startTransition(async () => {
      const idToken = await user.getIdToken();
      const result = await savePrivacyPolicyData(values, idToken);
      if (result.success) {
        toast({
          title: 'Success!',
          description: 'Privacy Policy page has been updated.',
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
            <Shield className="h-8 w-8 text-primary" />
            <div>
                <h1 className="text-2xl font-bold">Edit Privacy Policy</h1>
                <p className="text-muted-foreground">Update the content for the privacy policy page.</p>
            </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Page Content</CardTitle>
                <CardDescription>Edit the title and content. Line breaks will be preserved.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Privacy Policy" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Content</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Enter the full content of your privacy policy here..."
                                    className="min-h-[400px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
        
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
