import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useCTAs, useCTAPlacements } from '@/hooks/useCTAs';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { toast } from '@/hooks/use-toast';
import type { CTAPlacementFormData, CTAPlacementDBData } from '@/types/cta';

const placementSchema = z.object({
  cta_id: z.string().min(1, 'Please select a CTA'),
  blog_post_id: z.string().optional(),
  placement_position: z.array(z.enum(['top', 'bottom', 'below_toc', 'middle_article', 'inline_marker'])).min(1, 'Please select at least one position'),
  position_config: z.record(z.any()).default({}),
  priority: z.number().min(1).max(10),
  category_filter: z.array(z.string()).optional(),
  tag_filter: z.array(z.string()).optional(),
  active: z.boolean().default(true),
});

interface CTAPlacementBuilderProps {
  placement?: any;
  onSave?: (placement: any) => void;
  onCancel?: () => void;
}

export const CTAPlacementBuilder: React.FC<CTAPlacementBuilderProps> = ({ 
  placement, 
  onSave, 
  onCancel 
}) => {
  const { ctas } = useCTAs();
  const { posts, fetchUserPosts } = useBlogPosts();
  const { createPlacement, updatePlacement, deletePlacement } = useCTAPlacements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignmentType, setAssignmentType] = useState<'individual' | 'rule-based'>('individual');

  const form = useForm<CTAPlacementFormData>({
    resolver: zodResolver(placementSchema),
    defaultValues: placement ? {
      cta_id: placement.cta_id,
      blog_post_id: placement.blog_post_id || '',
      placement_position: Array.isArray(placement.placement_position) ? placement.placement_position : [placement.placement_position],
      position_config: placement.position_config || {},
      priority: placement.priority || 1,
      category_filter: placement.category_filter || [],
      tag_filter: placement.tag_filter || [],
      active: placement.active ?? true,
    } : {
      cta_id: '',
      blog_post_id: '',
      placement_position: [],
      position_config: {},
      priority: 1,
      category_filter: [],
      tag_filter: [],
      active: true,
    }
  });

  const selectedPositions = form.watch('placement_position');

  useEffect(() => {
    if (placement?.blog_post_id) {
      setAssignmentType('individual');
    } else if (placement?.category_filter?.length || placement?.tag_filter?.length) {
      setAssignmentType('rule-based');
    }
  }, [placement]);

  useEffect(() => {
    fetchUserPosts();
  }, [fetchUserPosts]);

  const onSubmit = async (data: CTAPlacementFormData) => {
    try {
      setIsSubmitting(true);

      // Clean up data based on assignment type
      let cleanedData = { ...data };
      
      if (assignmentType === 'individual') {
        // Clear rule-based filters for individual assignment
        cleanedData.category_filter = [];
        cleanedData.tag_filter = [];
      } else {
        // Clear blog_post_id for rule-based assignment
        cleanedData.blog_post_id = undefined;
      }

      // Handle multiple placement positions by creating separate placements
      const positions = data.placement_position;
      let results = [];

      if (placement) {
        // For updates with multiple positions, delete the existing placement and create new ones
        await deletePlacement(placement.id);
        for (const position of positions) {
          const singleData: CTAPlacementDBData = { ...cleanedData, placement_position: position };
          const result = await createPlacement(singleData);
          results.push(result);
        }
      } else {
        // For creates, create one placement for each position
        for (const position of positions) {
          const singleData: CTAPlacementDBData = { ...cleanedData, placement_position: position };
          const result = await createPlacement(singleData);
          results.push(result);
        }
      }

      toast({
        title: 'Success',
        description: `Placement${positions.length > 1 ? 's' : ''} ${placement ? 'updated' : 'created'} successfully`,
      });

      if (onSave) {
        onSave(results[0]); // Return the first result for callback compatibility
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${placement ? 'update' : 'create'} placement`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get unique categories from blog posts
  const categories = Array.from(new Set(posts.map(post => post.category).filter(Boolean)));
  
  // Get unique tags from blog posts (assuming tags are stored as comma-separated strings)
  const allTags = posts.flatMap(post => {
    if (typeof post.content === 'string' && post.content.includes('#')) {
      // Extract hashtags from content as a simple example
      return post.content.match(/#\w+/g)?.map(tag => tag.substring(1)) || [];
    }
    return [];
  });
  const tags = Array.from(new Set(allTags));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{placement ? 'Edit Placement' : 'Create CTA Placement'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* CTA Selection */}
            <FormField
              control={form.control}
              name="cta_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select CTA</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a CTA to place" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ctas.filter(cta => cta.status === 'active').map((cta) => (
                        <SelectItem key={cta.id} value={cta.id}>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{cta.type}</Badge>
                            {cta.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Assignment Type */}
            <div className="space-y-4">
              <FormLabel>Assignment Type</FormLabel>
              <Tabs value={assignmentType} onValueChange={(value) => setAssignmentType(value as 'individual' | 'rule-based')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="individual">Individual Blog Post</TabsTrigger>
                  <TabsTrigger value="rule-based">Rule-Based Assignment</TabsTrigger>
                </TabsList>

                <TabsContent value="individual" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="blog_post_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Blog Post</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a specific blog post" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {posts.map((post) => (
                              <SelectItem key={post.id} value={post.id}>
                                <div className="flex flex-col items-start">
                                  <span className="font-medium">{post.title}</span>
                                  <span className="text-sm text-muted-foreground">{post.category}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="rule-based" className="space-y-4">
                  {/* Category Filter */}
                  <div className="space-y-2">
                    <FormLabel>Categories (Optional)</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category}`}
                            checked={form.watch('category_filter')?.includes(category)}
                            onCheckedChange={(checked) => {
                              const current = form.getValues('category_filter') || [];
                              if (checked) {
                                form.setValue('category_filter', [...current, category]);
                              } else {
                                form.setValue('category_filter', current.filter(c => c !== category));
                              }
                            }}
                          />
                          <label htmlFor={`category-${category}`} className="text-sm">
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tag Filter */}
                  {tags.length > 0 && (
                    <div className="space-y-2">
                      <FormLabel>Tags (Optional)</FormLabel>
                      <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                        {tags.slice(0, 20).map((tag) => (
                          <div key={tag} className="flex items-center space-x-2">
                            <Checkbox
                              id={`tag-${tag}`}
                              checked={form.watch('tag_filter')?.includes(tag)}
                              onCheckedChange={(checked) => {
                                const current = form.getValues('tag_filter') || [];
                                if (checked) {
                                  form.setValue('tag_filter', [...current, tag]);
                                } else {
                                  form.setValue('tag_filter', current.filter(t => t !== tag));
                                }
                              }}
                            />
                            <label htmlFor={`tag-${tag}`} className="text-sm">
                              #{tag}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Placement Configuration */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="placement_position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placement Positions</FormLabel>
                    <div className="space-y-2">
                      {[
                        { value: 'top', label: 'Top of Post' },
                        { value: 'bottom', label: 'Bottom of Post' },
                        { value: 'below_toc', label: 'Below Table of Contents' },
                        { value: 'middle_article', label: 'Middle of Article (based on H2 headers)' },
                        { value: 'inline_marker', label: 'Inside Article (via markers)' }
                      ].map((position) => (
                        <div key={position.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`position-${position.value}`}
                            checked={field.value?.includes(position.value as any)}
                            onCheckedChange={(checked) => {
                              const current = Array.isArray(field.value) ? field.value : [];
                              if (checked) {
                                field.onChange([...current, position.value]);
                              } else {
                                field.onChange(current.filter((p: string) => p !== position.value));
                              }
                            }}
                          />
                          <label htmlFor={`position-${position.value}`} className="text-sm">
                            {position.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority (1-10)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        max="10" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Position-specific configuration */}
            {selectedPositions?.includes('inline_marker') && (
              <div className="space-y-2">
                <FormLabel>Inline Marker Configuration</FormLabel>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    Add markers in your blog content where you want CTAs to appear:
                  </p>
                  <code className="text-sm bg-background px-2 py-1 rounded">
                    [[CTA:marker-name]]
                  </code>
                  <p className="text-xs text-muted-foreground mt-2">
                    Replace "marker-name" with any identifier you choose
                  </p>
                </div>
                <Input
                  placeholder="Marker name (optional filter)"
                  onChange={(e) => {
                    form.setValue('position_config', { 
                      ...form.getValues('position_config'),
                      marker_name: e.target.value 
                    });
                  }}
                  defaultValue={form.getValues('position_config')?.marker_name || ''}
                />
              </div>
            )}

            {selectedPositions?.includes('middle_article') && (
              <div className="space-y-2">
                <FormLabel>Middle Article Configuration</FormLabel>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    CTA will be placed automatically before the middle H2 header in your article.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    For example: If there are 10 H2 headers, the CTA will appear before the 6th header.
                  </p>
                </div>
              </div>
            )}

            {/* Active Toggle */}
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Enable this placement to show the CTA
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

            <div className="flex justify-end gap-2">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : (placement ? 'Update Placement' : 'Create Placement')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};