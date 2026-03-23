
'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Calendar, Save, Monitor, Smartphone } from 'lucide-react';
import { saveAppointmentContentData } from './actions';
import { formSchema, type AppointmentContentData } from './types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';

interface AppointmentContentFormProps {
  initialData: AppointmentContentData;
}

export default function AppointmentContentForm({ initialData }: AppointmentContentFormProps) {
  const [isPending, startTransition] = useTransition();
  const { user } = useAuth();

  const form = useForm<AppointmentContentData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });
  
  const onSubmit = (values: AppointmentContentData) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to save changes.' });
      return;
    }
    startTransition(async () => {
      const idToken = await user.getIdToken();
      const result = await saveAppointmentContentData(values, idToken);
      if (result.success) {
        toast({
          title: 'Success!',
          description: 'Appointment section content has been updated.',
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
    <CardContent className="pt-6 space-y-6">
        <FormField
            control={form.control}
            name={`${device}.title`}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., APPOINTMENT REQUEST" {...field} />
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
                        <Textarea placeholder="e.g., Ready to take the next step?..." {...field} />
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
            <Calendar className="h-8 w-8 text-primary" />
            <div>
                <h1 className="text-2xl font-bold">Edit Appointment Section Content</h1>
                <p className="text-muted-foreground">Update the title and subtitle for the appointment form section.</p>
            </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Section Header</CardTitle>
                <CardDescription>The main title and subtitle for the appointment section.</CardDescription>
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
