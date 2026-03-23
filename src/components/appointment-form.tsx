
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import { differenceInYears, parse } from 'date-fns';

import { saveAppointmentRequest } from '@/app/admin/(admin)/appointments/actions';
import type { AppointmentContentData } from '@/app/admin/(admin)/appointment-content/types';
import type { Artist } from '@/app/admin/(admin)/artists/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const appointmentSchema = z.object({
  fullName: z.string().min(1, 'Full Name is required.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().min(1, 'Phone Number is required.'),
  dateOfBirth: z.string().min(1, 'Date of Birth is required.'),
  preferredArtist: z.string().optional(),
  tattooStyle: z.string().optional(),
  tattooDescription: z.string().min(10, 'Please provide a detailed description (min. 10 characters).'),
  budgetRange: z.string().optional(),
  preferredTimeframe: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

const tattooStyles = ['Realism', 'Traditional', 'Blackwork', 'Fine-line', 'Color', 'Japanese', 'Geometric', 'Other'];
const budgetRanges = ['Under $300', '$300 - $600', '$600 - $1000', '$1000 - $1500', '$1500+'];
const timeframes = ['ASAP', 'Within 1-2 weeks', 'Within a month', 'Flexible'];

interface AppointmentFormProps {
    initialContentData: AppointmentContentData;
    initialArtists: Artist[];
}

export default function AppointmentForm({ initialContentData, initialArtists }: AppointmentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { desktop, mobile } = initialContentData;

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      preferredArtist: 'No preference',
      tattooStyle: '',
      tattooDescription: '',
      budgetRange: '',
      preferredTimeframe: '',
    },
  });

  async function onSubmit(values: AppointmentFormValues) {
    if (values.dateOfBirth) {
        const date = parse(values.dateOfBirth, 'yyyy-MM-dd', new Date());
        if (isNaN(date.getTime())) {
             toast({
                variant: 'destructive',
                title: 'Invalid Date Format',
                description: 'Please enter the date in YYYY-MM-DD format.',
            });
            return;
        }
        if (differenceInYears(new Date(), date) < 18) {
            toast({
                variant: 'destructive',
                title: 'Submission Blocked',
                description: 'You must be at least 18 years old to book an appointment.',
            });
            return;
        }
    }

    setIsLoading(true);
    
    try {
      const result = await saveAppointmentRequest(values);
      if (result.success) {
        toast({
          title: 'Request Submitted!',
          description: 'Thank you for your request. We will get back to you shortly.',
        });
        form.reset();
      } else {
        throw new Error(result.error || 'An unknown error occurred.');
      }
    } catch(error: any) {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: error.message || 'There was a problem submitting your request.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section id="contact" className="relative pb-16 pt-[74px] bg-appointment-mobile-gray md:pt-24 md:pb-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center space-y-4 mb-12">
            <h2 className="text-4xl md:text-5xl font-bold font-headline text-foreground md:hidden">{mobile.title}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto md:hidden">
                {mobile.subtitle}
            </p>
            <h2 className="text-4xl md:text-5xl font-bold font-headline text-foreground hidden md:block">{desktop.title}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto hidden md:block">
                {desktop.subtitle}
            </p>
        </div>
        
        <Card className="max-w-4xl mx-auto border-border shadow-2xl">
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Date of Birth *</FormLabel>
                          <FormControl>
                              <Input placeholder="YYYY-MM-DD" {...field} />
                          </FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="preferredArtist"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Preferred Artist</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={"Select an artist"} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="No preference">No preference</SelectItem>
                                        {initialArtists.map(artist => (
                                            <SelectItem key={artist.id} value={artist.name}>{artist.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="tattooStyle"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tattoo Style</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select style" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {tattooStyles.map(style => (
                                            <SelectItem key={style} value={style}>{style}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                  control={form.control}
                  name="tattooDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tattoo Description *</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe your tattoo idea in detail..." className="min-h-[150px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="budgetRange"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Budget Range</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select budget" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {budgetRanges.map(range => (
                                            <SelectItem key={range} value={range}>{range}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="preferredTimeframe"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Preferred Timeframe</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select timeframe" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {timeframes.map(frame => (
                                            <SelectItem key={frame} value={frame}>{frame}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-center pt-4">
                  <Button type="submit" disabled={isLoading} size="lg" variant="outline" className="hover:bg-[#FAA938] hover:text-white hover:border-[#FAA938]">
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    SUBMIT APPOINTMENT REQUEST
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <div className="hidden md:block absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-background to-transparent pointer-events-none"></div>
    </section>
  );
}
