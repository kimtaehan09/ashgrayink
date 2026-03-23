
'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, Palette, Save } from 'lucide-react';
import { saveThemeData } from './actions';
import type { ThemeSectionData } from './actions';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/contexts/auth-context';

const hexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color code (e.g. #RRGGBB)');

const formSchema = z.object({
  colors: z.object({
    background: hexColorSchema,
    foreground: hexColorSchema,
    primary: hexColorSchema,
    primaryForeground: hexColorSchema,
    card: hexColorSchema,
    cardForeground: hexColorSchema,
    accent: hexColorSchema,
    accentForeground: hexColorSchema,
    border: hexColorSchema,
  }),
  fonts: z.object({
      baseSize: z.number().min(12).max(20),
  })
});

type ThemeFormValues = z.infer<typeof formSchema>;

interface ThemeFormProps {
  initialData: ThemeSectionData;
}

export default function ThemeForm({ initialData }: ThemeFormProps) {
  const [isPending, startTransition] = useTransition();
  const { user } = useAuth();

  const form = useForm<ThemeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        ...initialData,
        fonts: {
            baseSize: initialData.fonts.baseSize || 16,
        }
    },
  });
  
  const baseSize = form.watch('fonts.baseSize');

  const onSubmit = (values: ThemeFormValues) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to save changes.' });
      return;
    }
    startTransition(async () => {
      const idToken = await user.getIdToken();
      const result = await saveThemeData(values, idToken);
      if (result.success) {
        toast({
          title: 'Success!',
          description: 'Theme has been updated.',
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
  
  const colorFields: (keyof ThemeFormValues['colors'])[] = [
      'background', 'foreground', 'primary', 'primaryForeground', 'card', 'cardForeground', 'accent', 'accentForeground', 'border'
  ]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center gap-4 mb-4">
            <Palette className="h-8 w-8 text-primary" />
            <div>
                <h1 className="text-2xl font-bold">Edit Theme</h1>
                <p className="text-muted-foreground">Customize your website's colors and fonts.</p>
            </div>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>Color Palette</CardTitle>
                <CardDescription>Enter hex color codes for your site's theme. Changes will apply globally.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                 {colorFields.map((fieldName) => (
                    <FormField
                        key={fieldName}
                        control={form.control}
                        name={`colors.${fieldName}`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="capitalize flex items-center gap-2">
                                     <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: field.value }}></div>
                                    {fieldName.replace(/([A-Z])/g, ' $1')}
                                </FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                ))}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Typography</CardTitle>
                <CardDescription>Adjust the base font size for your website.</CardDescription>
            </CardHeader>
            <CardContent>
                 <FormField
                    control={form.control}
                    name="fonts.baseSize"
                    render={({ field: { value, onChange } }) => (
                        <FormItem>
                            <FormLabel>Base Font Size: {baseSize}px</FormLabel>
                            <FormControl>
                                <Slider
                                    min={12}
                                    max={20}
                                    step={1}
                                    value={[value]}
                                    onValueChange={(vals) => onChange(vals[0])}
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
