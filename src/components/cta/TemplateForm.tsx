import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CTATemplate, CTAType, CTAActionType, CTATemplateType } from '@/types/cta';
import { useCTATemplates } from '@/hooks/useCTATemplates';
import { toast } from '@/hooks/use-toast';

const templateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  template_type: z.string().min(1, 'Template type is required'),
  type: z.string().min(1, 'CTA type is required'),
  action_type: z.string().min(1, 'Action type is required'),
  headline: z.string().min(1, 'Headline is required'),
  description: z.string().optional(),
  button_text: z.string().min(1, 'Button text is required'),
  background_color: z.string().optional(),
  text_color: z.string().optional(),
  button_color: z.string().optional(),
  button_hover_color: z.string().optional(),
  size: z.string().optional(),
  border_radius: z.string().optional(),
  icon_name: z.string().optional(),
});

type TemplateFormData = z.infer<typeof templateSchema>;

interface TemplateFormProps {
  template?: CTATemplate | null;
  onClose: () => void;
}

export const TemplateForm: React.FC<TemplateFormProps> = ({ template, onClose }) => {
  const { createTemplate, updateTemplate } = useCTATemplates();
  
  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: template ? {
      name: template.name,
      template_type: template.template_type,
      type: (template.template_config as any)?.type || 'button',
      action_type: (template.template_config as any)?.action_type || 'navigate_url',
      headline: (template.template_config as any)?.headline || '',
      description: (template.template_config as any)?.description || '',
      button_text: (template.template_config as any)?.button_text || '',
      background_color: (template.template_config as any)?.styling?.background_color || '',
      text_color: (template.template_config as any)?.styling?.text_color || '',
      button_color: (template.template_config as any)?.styling?.button_color || '',
      button_hover_color: (template.template_config as any)?.styling?.button_hover_color || '',
      size: (template.template_config as any)?.styling?.size || 'medium',
      border_radius: (template.template_config as any)?.styling?.border_radius || 'md',
      icon_name: (template.template_config as any)?.styling?.icon_name || '',
    } : {
      name: '',
      template_type: 'newsletter_signup',
      type: 'button',
      action_type: 'navigate_url',
      headline: '',
      description: '',
      button_text: '',
      background_color: '',
      text_color: '',
      button_color: '',
      button_hover_color: '',
      size: 'medium',
      border_radius: 'md',
      icon_name: '',
    },
  });

  const onSubmit = async (data: TemplateFormData) => {
    try {
      const templateConfig = {
        type: data.type as CTAType,
        action_type: data.action_type as CTAActionType,
        headline: data.headline,
        description: data.description,
        button_text: data.button_text,
        styling: {
          background_color: data.background_color,
          text_color: data.text_color,
          button_color: data.button_color,
          button_hover_color: data.button_hover_color,
          size: data.size,
          border_radius: data.border_radius,
          icon_name: data.icon_name,
        },
        behavior: {
          open_in_new_tab: false,
        },
      };

      if (template) {
        await updateTemplate(template.id, {
          name: data.name,
          template_type: data.template_type as CTATemplateType,
          template_config: templateConfig,
        });
        toast({
          title: "Success",
          description: "Template updated successfully",
        });
      } else {
        await createTemplate({
          name: data.name,
          template_type: data.template_type as CTATemplateType,
          template_config: templateConfig,
        });
        toast({
          title: "Success",
          description: "Template created successfully",
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Edit Template' : 'Create New Template'}
          </DialogTitle>
          <DialogDescription>
            {template ? 'Update template configuration' : 'Create a new CTA template for reuse'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Newsletter Blue Button" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="template_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="newsletter_signup">Newsletter Signup</SelectItem>
                        <SelectItem value="product_promotion">Product Promotion</SelectItem>
                        <SelectItem value="content_download">Content Download</SelectItem>
                        <SelectItem value="related_articles">Related Articles</SelectItem>
                        <SelectItem value="social_sharing">Social Sharing</SelectItem>
                        <SelectItem value="contact_form">Contact Form</SelectItem>
                        <SelectItem value="free_trial">Free Trial</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CTA Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="button">Button</SelectItem>
                        <SelectItem value="banner">Banner</SelectItem>
                        <SelectItem value="inline_text">Inline Text</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="popup">Popup</SelectItem>
                        <SelectItem value="sidebar_widget">Sidebar Widget</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="action_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Action Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="navigate_url">Navigate to URL</SelectItem>
                        <SelectItem value="download_file">Download File</SelectItem>
                        <SelectItem value="open_modal">Open Modal</SelectItem>
                        <SelectItem value="submit_form">Submit Form</SelectItem>
                        <SelectItem value="email_signup">Email Signup</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="headline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Headline</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Get Weekly Updates" {...field} />
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
                        placeholder="Additional description text..."
                        className="resize-none"
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
                      <Input placeholder="e.g., Subscribe Now" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Size</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="border_radius"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Border Radius</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="sm">Small</SelectItem>
                        <SelectItem value="md">Medium</SelectItem>
                        <SelectItem value="lg">Large</SelectItem>
                        <SelectItem value="xl">Extra Large</SelectItem>
                        <SelectItem value="full">Full</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="background_color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Background Color</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input placeholder="#ffffff" {...field} />
                        <input
                          type="color"
                          value={field.value || '#ffffff'}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="w-12 h-10 border rounded"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="button_color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Button Color</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input placeholder="#000000" {...field} />
                        <input
                          type="color"
                          value={field.value || '#000000'}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="w-12 h-10 border rounded"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {template ? 'Update Template' : 'Create Template'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};