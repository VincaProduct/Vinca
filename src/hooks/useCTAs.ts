import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import type { CTAWithPlacement, CTAFormData, CTAAnalyticsData, CTAPlacementFormData, CTAPlacementDBData, CTAPlacementPosition } from '@/types/cta';

type CTA = Tables<'ctas'>;
type CTAPlacement = Tables<'cta_placements'> & {
  cta: CTA;
};

export const useCTAs = () => {
  const [ctas, setCTAs] = useState<CTA[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCTAs = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ctas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCTAs(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch CTAs');
    } finally {
      setLoading(false);
    }
  }, []);

  const createCTA = async (ctaData: CTAFormData) => {
    try {
      const { data, error } = await supabase
        .from('ctas')
        .insert(ctaData)
        .select()
        .single();

      if (error) throw error;
      
      await fetchCTAs();
      return data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create CTA');
    }
  };

  const updateCTA = async (id: string, ctaData: Partial<CTAFormData>) => {
    try {
      const { data, error } = await supabase
        .from('ctas')
        .update(ctaData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchCTAs();
      return data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update CTA');
    }
  };

  const deleteCTA = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ctas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchCTAs();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete CTA');
    }
  };

  const duplicateCTA = async (id: string) => {
    try {
      const { data: originalCTA, error: fetchError } = await supabase
        .from('ctas')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const duplicatedData = {
        ...originalCTA,
        name: `${originalCTA.name} (Copy)`,
        id: undefined,
        created_at: undefined,
        updated_at: undefined,
      };

      const { data, error } = await supabase
        .from('ctas')
        .insert(duplicatedData)
        .select()
        .single();

      if (error) throw error;
      
      await fetchCTAs();
      return data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to duplicate CTA');
    }
  };

  useEffect(() => {
    fetchCTAs();
  }, [fetchCTAs]);

  // Get CTAs for a specific blog post with proper placement filtering
  const getBlogPostCTAs = async (
    blogPostId: string, 
    category?: string, 
    tags?: string[]
  ): Promise<CTAWithPlacement[]> => {
    try {
      // Get active placements with their associated CTAs
      let query = supabase
        .from('cta_placements')
        .select(`
          *,
          cta:ctas!inner(*)
        `)
        .eq('active', true)
        .eq('ctas.status', 'active');

      // Handle different types of blog post IDs (UUID vs string identifiers)
      if (blogPostId && blogPostId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
        // Valid UUID - can filter by blog_post_id
        query = query.or(
          `blog_post_id.eq.${blogPostId},and(blog_post_id.is.null,or(category_filter.is.null,category_filter.cs.{${category || ''}}))`
        );
      } else {
        // Not a UUID (like "blog-listing-page") - only use rule-based matching
        query = query.or(
          `and(blog_post_id.is.null,or(category_filter.is.null,category_filter.cs.{${category || ''}}))`
        );
      }

      const { data, error } = await query;
      
      if (error) throw error;

      // Transform the data to match CTAWithPlacement interface
      return (data || []).map(placement => ({
        ...placement.cta,
        placement_position: placement.placement_position as CTAPlacementPosition,
        position_config: placement.position_config,
        priority: placement.priority
      })) as CTAWithPlacement[];
    } catch (err) {
      console.error('Error fetching blog post CTAs:', err);
      return [];
    }
  };

  return {
    ctas,
    loading,
    error,
    fetchCTAs,
    createCTA,
    updateCTA,
    deleteCTA,
    duplicateCTA,
    getBlogPostCTAs
  };
};

export const useCTAPlacements = () => {
  const [placements, setPlacements] = useState<CTAPlacement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlacements = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cta_placements')
        .select(`
          *,
          cta:ctas(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlacements(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch placements');
    } finally {
      setLoading(false);
    }
  }, []);

  const createPlacement = async (placementData: CTAPlacementDBData) => {
    try {
      const { data, error } = await supabase
        .from('cta_placements')
        .insert(placementData)
        .select(`
          *,
          cta:ctas(*)
        `)
        .single();

      if (error) throw error;
      
      await fetchPlacements();
      return data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create placement');
    }
  };

  const updatePlacement = async (id: string, placementData: Partial<CTAPlacementDBData>) => {
    try {
      const { data, error } = await supabase
        .from('cta_placements')
        .update(placementData)
        .eq('id', id)
        .select(`
          *,
          cta:ctas(*)
        `)
        .single();

      if (error) throw error;
      
      await fetchPlacements();
      return data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update placement');
    }
  };

  const deletePlacement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cta_placements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchPlacements();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete placement');
    }
  };

  useEffect(() => {
    fetchPlacements();
  }, [fetchPlacements]);

  return {
    placements,
    loading,
    error,
    fetchPlacements,
    createPlacement,
    updatePlacement,
    deletePlacement
  };
};

export const useCTAAnalytics = () => {
  const trackCTAEvent = useCallback(async (analyticsData: CTAAnalyticsData) => {
    try {
      // Generate session ID if not provided
      const sessionId = analyticsData.session_id || 
        sessionStorage.getItem('cta_session_id') || 
        `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      if (!sessionStorage.getItem('cta_session_id')) {
        sessionStorage.setItem('cta_session_id', sessionId);
      }

      // For view events, check if we've already tracked this CTA view in this session
      if (analyticsData.event_type === 'view') {
        const viewedCTAsKey = `viewed_ctas_${sessionId}`;
        const viewedCTAs = JSON.parse(sessionStorage.getItem(viewedCTAsKey) || '[]');
        const ctaViewKey = `${analyticsData.cta_id}_${analyticsData.blog_post_id}`;
        
        if (viewedCTAs.includes(ctaViewKey)) {
          // Already tracked this CTA view in this session
          return;
        }
        
        // Mark this CTA as viewed
        viewedCTAs.push(ctaViewKey);
        sessionStorage.setItem(viewedCTAsKey, JSON.stringify(viewedCTAs));
      }

      const { error } = await supabase
        .from('cta_analytics')
        .insert({
          ...analyticsData,
          session_id: sessionId,
          referrer: analyticsData.referrer || document.referrer,
          user_agent: analyticsData.user_agent || navigator.userAgent,
          device_type: analyticsData.device_type || (navigator.userAgent.match(/Mobile|Tablet/) ? 'mobile' : 'desktop')
        });

      if (error) throw error;
    } catch (err) {
      console.error('Error tracking CTA event:', err);
    }
  }, []);

  const getCTAAnalytics = useCallback(async (ctaId?: string, startDate?: string, endDate?: string) => {
    try {
      let query = supabase
        .from('cta_analytics')
        .select(`
          *,
          cta:ctas(name, type),
          blog_post:blog_posts(title, slug)
        `)
        .order('created_at', { ascending: false });

      if (ctaId) {
        query = query.eq('cta_id', ctaId);
      }

      if (startDate) {
        query = query.gte('created_at', startDate);
      }

      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching CTA analytics:', err);
      return [];
    }
  }, []);

  return {
    trackCTAEvent,
    getCTAAnalytics
  };
};