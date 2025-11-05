import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CTATemplate, CTATemplateType, CTATemplateConfig } from '@/types/cta';
import { toast } from '@/hooks/use-toast';

export const useCTATemplates = () => {
  const [templates, setTemplates] = useState<CTATemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('cta_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch templates';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (templateData: {
    name: string;
    template_type: CTATemplateType;
    template_config: CTATemplateConfig;
  }) => {
    try {
      const { data, error } = await supabase
        .from('cta_templates')
        .insert([{
          ...templateData,
          template_config: templateData.template_config as any
        }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchTemplates();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create template';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateTemplate = async (id: string, templateData: Partial<CTATemplate>) => {
    try {
      const { data, error } = await supabase
        .from('cta_templates')
        .update(templateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchTemplates();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update template';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cta_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchTemplates();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete template';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const getTemplatesByType = (ctaType: string) => {
    return templates.filter(template => 
      template.template_config && 
      typeof template.template_config === 'object' &&
      'type' in template.template_config &&
      template.template_config.type === ctaType
    );
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplatesByType,
  };
};