import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Plus, X, Eye, EyeOff } from 'lucide-react';
import { useCTAs, useCTAPlacements, fetchDefaultCTAs } from '@/hooks/useCTAs';
import { DEFAULT_POSITIONS, type CtaRow } from '@/lib/ctas';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { CTAPlacementPosition } from '@/types/cta';

interface CTASelectionFormProps {
  blogPostId?: string;
  onCTASelectionChange?: (ctas: SelectedCTA[]) => void;
  /** Default CTAs switched off for this post (saved with the post) */
  hiddenDefaults?: string[];
  onHiddenDefaultsChange?: (ids: string[]) => void;
}

export interface SelectedCTA {
  id: string;
  cta_id: string;
  name: string;
  placement_positions: CTAPlacementPosition[];
  priority: number;
  active: boolean;
}

type Placements = ReturnType<typeof useCTAPlacements>;

/**
 * Replace a post's CTA placements with the given selection. Used by the
 * "Save CTA Placements" button and when the post itself is saved (which is
 * the only way to attach CTAs to a brand-new post, as it has no id before).
 */
export const saveCTAPlacements = async (
  blogPostId: string,
  selectedCTAs: SelectedCTA[],
  { createPlacement }: Pick<Placements, 'createPlacement'>,
) => {
  // Remove the post's current placements, read fresh from the database (a
  // component's cached list may be out of date), then add the selection
  const { error } = await supabase.from('cta_placements').delete().eq('blog_post_id', blogPostId);
  if (error) throw error;
  for (const selectedCTA of selectedCTAs) {
    if (!selectedCTA.active) continue;
    for (const position of selectedCTA.placement_positions) {
      await createPlacement({
        cta_id: selectedCTA.cta_id,
        blog_post_id: blogPostId,
        placement_position: position,
        position_config: {},
        priority: selectedCTA.priority,
        active: selectedCTA.active,
      });
    }
  }
};

export const CTASelectionForm: React.FC<CTASelectionFormProps> = ({
  blogPostId,
  onCTASelectionChange,
  hiddenDefaults = [],
  onHiddenDefaultsChange,
}) => {
  const [selectedCTAs, setSelectedCTAs] = useState<SelectedCTA[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const { ctas } = useCTAs();
  const { createPlacement, deletePlacement, placements } = useCTAPlacements();
  const { toast } = useToast();
  // CTAs set as defaults in CTA Management: on every post unless switched off here
  const [defaultCTAs, setDefaultCTAs] = useState<CtaRow[]>([]);
  useEffect(() => {
    fetchDefaultCTAs().then(setDefaultCTAs);
  }, []);

  const toggleDefault = (ctaId: string, show: boolean) => {
    onHiddenDefaultsChange?.(show ? hiddenDefaults.filter((id) => id !== ctaId) : [...hiddenDefaults, ctaId]);
  };

  const placementOptions = [
    { value: 'top', label: 'Top of Article' },
    { value: 'below_toc', label: 'Below Table of Contents' },
    { value: 'middle_article', label: 'Middle of Article (H2 based)' },
    { value: 'bottom', label: 'Bottom of Article' },
    { value: 'inline_marker', label: 'Inline Marker' }
  ] as const;

  // Load existing CTA placements for this blog post
  useEffect(() => {
    if (blogPostId) {
      const blogPlacements = placements.filter(p => p.blog_post_id === blogPostId);
      const existingCTAs = blogPlacements.map(placement => ({
        id: placement.id,
        cta_id: placement.cta_id,
        name: placement.cta?.name || 'Unknown CTA',
        placement_positions: [placement.placement_position] as CTAPlacementPosition[],
        priority: placement.priority || 1,
        active: placement.active || true
      }));
      setSelectedCTAs(existingCTAs);
    }
  }, [blogPostId, placements]);

  const addCTA = () => {
    if (ctas.length > 0) {
      const newCTA: SelectedCTA = {
        id: `temp-${Date.now()}`,
        cta_id: ctas[0].id,
        name: ctas[0].name,
        placement_positions: ['bottom'],
        priority: selectedCTAs.length + 1,
        active: true
      };
      const updated = [...selectedCTAs, newCTA];
      setSelectedCTAs(updated);
      onCTASelectionChange?.(updated);
    }
  };

  const removeCTA = async (index: number) => {
    const cta = selectedCTAs[index];
    
    // If it's an existing placement (has a real ID), delete from database
    if (blogPostId && !cta.id.startsWith('temp-')) {
      try {
        await deletePlacement(cta.id);
        toast({
          title: 'Success',
          description: 'CTA placement removed successfully'
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to remove CTA placement',
          variant: 'destructive'
        });
        return;
      }
    }

    const updated = selectedCTAs.filter((_, i) => i !== index);
    setSelectedCTAs(updated);
    onCTASelectionChange?.(updated);
  };

  const updateCTA = (index: number, updates: Partial<SelectedCTA>) => {
    const updated = selectedCTAs.map((cta, i) => {
      if (i === index) {
        const updatedCTA = { ...cta, ...updates };
        // Update name when CTA ID changes
        if (updates.cta_id) {
          const selectedCTAData = ctas.find(c => c.id === updates.cta_id);
          if (selectedCTAData) {
            updatedCTA.name = selectedCTAData.name;
          }
        }
        return updatedCTA;
      }
      return cta;
    });
    setSelectedCTAs(updated);
    onCTASelectionChange?.(updated);
  };

  const togglePlacementPosition = (index: number, position: CTAPlacementPosition) => {
    const cta = selectedCTAs[index];
    const positions = cta.placement_positions.includes(position)
      ? cta.placement_positions.filter(p => p !== position)
      : [...cta.placement_positions, position];
    
    updateCTA(index, { placement_positions: positions });
  };

  const savePlacements = async () => {
    if (!blogPostId) {
      toast({
        title: 'Error',
        description: 'Blog post must be saved before adding CTAs',
        variant: 'destructive'
      });
      return;
    }

    try {
      await saveCTAPlacements(blogPostId, selectedCTAs, { createPlacement });
      // Default CTAs switched off for this post
      if (defaultCTAs.length > 0) {
        const { error } = await supabase.from('blog_posts').update({ hidden_default_ctas: hiddenDefaults }).eq('id', blogPostId);
        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: 'CTA placements saved successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save CTA placements',
        variant: 'destructive'
      });
    }
  };

  const shownDefaults = defaultCTAs.filter((c) => !hiddenDefaults.includes(c.id)).length;

  if (ctas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            CTA Management
            <Badge variant="secondary">No CTAs Available</Badge>
          </CardTitle>
          <CardDescription>
            Create CTAs first in the CTA Dashboard to use them in blog posts.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              CTA Management
              {selectedCTAs.length + shownDefaults > 0 && (
                <Badge variant="secondary">{selectedCTAs.length + shownDefaults} on this post</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Default CTAs appear on every post automatically; add more for this post below
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Default CTAs (set in CTA Management) */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div>
              <Label className="text-sm font-medium">Default CTAs</Label>
              <p className="text-xs text-muted-foreground">
                Added to every post automatically. Switch one off to hide it on this post only. Change which CTAs are defaults in CTA Management.
              </p>
            </div>
            {defaultCTAs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No default CTAs yet. In CTA Management, edit a CTA and choose where it shows by default.</p>
            ) : (
              defaultCTAs.map((cta) => (
                <div key={cta.id} className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{cta.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {DEFAULT_POSITIONS.find((p) => p.value === cta.default_position)?.label}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">{hiddenDefaults.includes(cta.id) ? 'Hidden' : 'Shown'}</span>
                    <Switch
                      checked={!hiddenDefaults.includes(cta.id)}
                      onCheckedChange={(show) => toggleDefault(cta.id, show)}
                      aria-label={`Show ${cta.name} on this post`}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {selectedCTAs.length > 0 && <Label className="text-sm font-medium block pt-2">CTAs for this post only</Label>}
          {selectedCTAs.map((selectedCTA, index) => (
            <div key={selectedCTA.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Label className="text-sm font-medium">CTA #{index + 1}</Label>
                  <Checkbox
                    checked={selectedCTA.active}
                    onCheckedChange={(checked) => 
                      updateCTA(index, { active: checked as boolean })
                    }
                  />
                  <span className="text-sm text-muted-foreground">Active</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCTA(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Select CTA</Label>
                  <Select
                    value={selectedCTA.cta_id}
                    onValueChange={(value) => updateCTA(index, { cta_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a CTA" />
                    </SelectTrigger>
                    <SelectContent>
                      {ctas
                        .filter(cta => cta.status === 'active')
                        .map((cta) => (
                          <SelectItem key={cta.id} value={cta.id}>
                            {cta.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={selectedCTA.priority.toString()}
                    onValueChange={(value) => updateCTA(index, { priority: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((priority) => (
                        <SelectItem key={priority} value={priority.toString()}>
                          Priority {priority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Placement Positions</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {placementOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${selectedCTA.id}-${option.value}`}
                        checked={selectedCTA.placement_positions.includes(option.value)}
                        onCheckedChange={() => togglePlacementPosition(index, option.value)}
                      />
                      <Label
                        htmlFor={`${selectedCTA.id}-${option.value}`}
                        className="text-sm cursor-pointer"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="outline" onClick={addCTA} className="gap-2">
              <Plus className="w-4 h-4" />
              Add CTA for this post
            </Button>
            
            {blogPostId ? (
              <Button onClick={savePlacements}>
                Save CTA Placements
              </Button>
            ) : (
              (selectedCTAs.length > 0 || hiddenDefaults.length > 0) && (
                <p className="text-sm text-muted-foreground text-right">
                  These CTAs will be saved with the post when you click Save as Draft or Publish.
                </p>
              )
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};