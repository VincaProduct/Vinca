import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { SimpleCTAPreview } from './SimpleCTAPreview';
import { useCTAs } from '@/hooks/useCTAs';
import { toast } from '@/hooks/use-toast';
import type { CTAFormData } from '@/types/cta';

const ctaSchema = z.object({
  name: z.string().min(1, 'CTA name is required'),
  type: z.enum(['button', 'banner', 'card']),
  action_type: z.enum(['navigate_url', 'download_file', 'email_signup']),
  headline: z.string().min(1, 'Headline is required'),
  description: z.string().optional(),
  button_text: z.string().min(1, 'Button text is required'),
  action_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  open_in_new_tab: z.boolean().default(false),
  status: z.string().default('active'),
});

interface CTABuilderProps {
  cta?: any;
  onSave?: (cta: any) => void;
  onCancel?: () => void;
}

export const CTABuilderV2: React.FC<CTABuilderProps> = ({ cta, onSave, onCancel }) => {
  const { createCTA, updateCTA } = useCTAs();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CTAFormData>({
    resolver: zodResolver(ctaSchema),
    defaultValues: cta ? {
      name: cta.name,
      type: cta.type,
      action_type: cta.action_type,
      headline: cta.headline,
      description: cta.description || '',
      button_text: cta.button_text,
      action_url: cta.action_url || '',
      open_in_new_tab: cta.open_in_new_tab || false,
      status: cta.status || 'active',
    } : {
      name: '',
      type: 'button',
      action_type: 'navigate_url',
      headline: '',
      description: '',
      button_text: '',
      action_url: '',
      open_in_new_tab: false,
      status: 'active',
    },
  });

  const watchedValues = form.watch();

  const onSubmit = async (data: CTAFormData) => {
    try {
      setIsSubmitting(true);
      
      let result;
      if (cta) {
        result = await updateCTA(cta.id, data);
        toast({
          title: "Success",
          description: "CTA updated successfully",
        });
      } else {
        result = await createCTA(data);
        toast({
          title: "Success",
          description: "CTA created successfully",
        });
      }

      onSave?.(result);
    } catch (error) {
      console.error('Error saving CTA:', error);
      toast({
        title: "Error",
        description: "Failed to save CTA",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{cta ? 'Edit CTA' : 'Create New CTA'}</h2>
          <p className="text-muted-foreground">
            Simple call-to-action configuration
          </p>
        </div>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>CTA Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Basic Info */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CTA Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Internal name for this CTA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CTA Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select CTA type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="button">Button</SelectItem>
                            <SelectItem value="banner">Banner</SelectItem>
                            <SelectItem value="card">Card</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="headline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Headline</FormLabel>
                        <FormControl>
                          <Input placeholder="Main headline text" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Additional description text"
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="button_text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Button Text</FormLabel>
                        <FormControl>
                          <Input placeholder="Call to action text" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Action */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="action_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Action Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select action" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="navigate_url">Navigate to URL</SelectItem>
                            <SelectItem value="download_file">Download File</SelectItem>
                            <SelectItem value="email_signup">Email Signup</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="action_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Action URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="open_in_new_tab"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Open in New Tab</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Open the action URL in a new browser tab
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : (cta ? 'Update CTA' : 'Create CTA')}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Live Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleCTAPreview 
              type={watchedValues.type}
              headline={watchedValues.headline}
              description={watchedValues.description}
              buttonText={watchedValues.button_text}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};