import React from 'react';
import { CTATemplate, CTAType } from '@/types/cta';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TemplateSelectorProps {
  templates: CTATemplate[];
  ctaType: CTAType;
  selectedTemplate?: CTATemplate;
  onTemplateSelect: (template: CTATemplate) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  ctaType,
  selectedTemplate,
  onTemplateSelect,
}) => {
  const filteredTemplates = templates.filter(template => 
    template.template_config && 
    typeof template.template_config === 'object' &&
    'type' in template.template_config &&
    template.template_config.type === ctaType
  );

  if (filteredTemplates.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No templates available for {ctaType} type.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Create templates in the Template Management page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((template) => (
          <Card
            key={template.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md border-2",
              selectedTemplate?.id === template.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
            onClick={() => onTemplateSelect(template)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                {selectedTemplate?.id === template.id && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary">{template.template_type}</Badge>
                <Badge variant="outline">
                  {typeof template.template_config === 'object' && 
                   'type' in template.template_config ? 
                   String(template.template_config.type) : 'Unknown'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Template Preview */}
                <div className="border rounded-lg p-3 bg-muted/50">
                  <TemplatePreview template={template} />
                </div>
                
                <Button
                  variant={selectedTemplate?.id === template.id ? "default" : "outline"}
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTemplateSelect(template);
                  }}
                >
                  {selectedTemplate?.id === template.id ? "Selected" : "Select Template"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const TemplatePreview: React.FC<{ template: CTATemplate }> = ({ template }) => {
  if (!template.template_config || typeof template.template_config !== 'object') {
    return <div className="text-xs text-muted-foreground">No preview available</div>;
  }
  
  const config = template.template_config as any;

  const styling = config.styling || {};
  
  return (
    <div className="text-xs space-y-1">
      <div className="font-medium truncate">{config.headline || 'Sample Headline'}</div>
      {config.description && (
        <div className="text-muted-foreground truncate">{config.description}</div>
      )}
      <div 
        className="inline-block px-2 py-1 rounded text-xs font-medium"
        style={{
          backgroundColor: styling.button_color || '#000',
          color: styling.text_color || '#fff',
          borderRadius: styling.border_radius === 'full' ? '9999px' : 
                       styling.border_radius === 'lg' ? '8px' : 
                       styling.border_radius === 'md' ? '6px' : '4px'
        }}
      >
        {config.button_text || 'Button Text'}
      </div>
    </div>
  );
};