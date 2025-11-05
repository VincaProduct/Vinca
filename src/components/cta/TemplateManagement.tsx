import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useCTATemplates } from '@/hooks/useCTATemplates';
import { CTATemplate } from '@/types/cta';
import { TemplateForm } from './TemplateForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export const TemplateManagement: React.FC = () => {
  const { templates, loading, deleteTemplate } = useCTATemplates();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CTATemplate | null>(null);

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setIsFormOpen(true);
  };

  const handleEdit = (template: CTATemplate) => {
    setEditingTemplate(template);
    setIsFormOpen(true);
  };

  const handleDelete = async (templateId: string) => {
    await deleteTemplate(templateId);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingTemplate(null);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading templates...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">CTA Templates</h1>
          <p className="text-muted-foreground">
            Manage pre-defined templates for different CTA types
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">No templates created yet.</p>
            <Button onClick={handleCreateNew}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="secondary">{template.template_type}</Badge>
                      <Badge variant="outline">
                        {typeof template.template_config === 'object' && 
                         'type' in template.template_config ? 
                         String(template.template_config.type) : 'Unknown'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(template)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Template</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{template.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(template.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Template Preview */}
                  <div className="border rounded-lg p-3 bg-muted/50">
                    <TemplatePreview template={template} />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(template.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isFormOpen && (
        <TemplateForm
          template={editingTemplate}
          onClose={handleFormClose}
        />
      )}
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
    <div className="text-xs space-y-2">
      <div className="font-medium truncate">{config.headline || 'Sample Headline'}</div>
      {config.description && (
        <div className="text-muted-foreground truncate">{config.description}</div>
      )}
      <div 
        className="inline-block px-3 py-1 rounded text-xs font-medium"
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