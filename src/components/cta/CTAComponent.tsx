import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCTAAnalytics } from '@/hooks/useCTAs';
import type { CTAWithPlacement } from '@/types/cta';
import { ExternalLink, Download, Mail, FileText, ArrowRight, Heart, Share2, MessageCircle, ChevronRight } from 'lucide-react';

interface CTAComponentProps {
  cta: CTAWithPlacement;
  blogPostId: string;
}

const getIcon = (iconName?: string) => {
  if (!iconName || iconName === 'none') return null;
  
  const iconMap: Record<string, React.ComponentType<any>> = {
    'external-link': ExternalLink,
    'download': Download,
    'mail': Mail,
    'file-text': FileText,
    'arrow-right': ArrowRight,
    'heart': Heart,
    'share-2': Share2,
    'message-circle': MessageCircle,
    'chevron-right': ChevronRight,
  };
  
  const IconComponent = iconMap[iconName];
  return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
};

export const CTAComponent: React.FC<CTAComponentProps> = ({ cta, blogPostId }) => {
  const { trackCTAEvent } = useCTAAnalytics();

  // Track CTA view
  useEffect(() => {
    trackCTAEvent({
      cta_id: cta.id,
      blog_post_id: blogPostId,
      event_type: 'view'
    });
  }, [cta.id, blogPostId, trackCTAEvent]);

  const handleCTAClick = () => {
    // Track click event
    trackCTAEvent({
      cta_id: cta.id,
      blog_post_id: blogPostId,
      event_type: 'click'
    });

    // Handle different action types
    switch (cta.action_type) {
      case 'navigate_url':
        if (cta.action_url) {
          if (cta.open_in_new_tab) {
            window.open(cta.action_url, '_blank', 'noopener,noreferrer');
          } else {
            window.location.href = cta.action_url;
          }
        }
        break;
      case 'download_file':
        if (cta.action_url) {
          const link = document.createElement('a');
          link.href = cta.action_url;
          link.download = '';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        break;
      case 'email_signup':
        // Handle email signup - could open a modal or redirect
        if (cta.action_url) {
          window.open(cta.action_url, '_blank', 'noopener,noreferrer');
        }
        break;
      default:
        if (cta.action_url) {
          window.open(cta.action_url, '_blank', 'noopener,noreferrer');
        }
    }
  };

  // Generate style object from CTA configuration
  const getButtonStyle = () => {
    const style: React.CSSProperties = {};
    
    if (cta.button_color) {
      style.backgroundColor = cta.button_color;
    }
    if (cta.text_color) {
      style.color = cta.text_color;
    }
    
    return style;
  };

  const getContainerStyle = () => {
    const style: React.CSSProperties = {};
    
    if (cta.background_color) {
      style.backgroundColor = cta.background_color;
    }
    if (cta.background_image) {
      style.backgroundImage = `url(${cta.background_image})`;
      style.backgroundSize = 'cover';
      style.backgroundPosition = 'center';
    }
    
    return style;
  };

  const getSizeClass = () => {
    switch (cta.size) {
      case 'small': return 'text-sm px-4 py-2';
      case 'large': return 'text-lg px-8 py-4';
      default: return 'text-base px-6 py-3';
    }
  };

  const getBorderRadiusClass = () => {
    switch (cta.border_radius) {
      case 'none': return 'rounded-none';
      case 'sm': return 'rounded-sm';
      case 'lg': return 'rounded-lg';
      case 'xl': return 'rounded-xl';
      case 'full': return 'rounded-full';
      default: return 'rounded-md';
    }
  };

  // Render different CTA types
  const renderCTAContent = () => {
    const icon = getIcon(cta.icon_name);
    
    switch (cta.type) {
      case 'button':
        return (
          <div className="text-center">
            {cta.description && (
              <p className="mb-4 text-muted-foreground">{cta.description}</p>
            )}
            <Button
              onClick={handleCTAClick}
              className={`${getSizeClass()} ${getBorderRadiusClass()}`}
              style={getButtonStyle()}
            >
              {icon && <span className="mr-2">{icon}</span>}
              {cta.button_text}
            </Button>
          </div>
        );

      case 'banner':
        return (
          <div 
            className={`p-6 ${getBorderRadiusClass()} cursor-pointer transition-all duration-200 hover:shadow-lg`}
            style={getContainerStyle()}
            onClick={handleCTAClick}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">{cta.headline}</h3>
                {cta.description && (
                  <p className="text-muted-foreground">{cta.description}</p>
                )}
              </div>
              <div className="flex items-center">
                {icon && <span className="mr-2">{icon}</span>}
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        );

      case 'card':
        return (
          <Card 
            className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${getBorderRadiusClass()}`}
            style={getContainerStyle()}
            onClick={handleCTAClick}
          >
            <div className="text-center">
              {icon && (
                <div className="mb-4 flex justify-center">
                  <div className="p-3 bg-primary/10 rounded-full">
                    {icon}
                  </div>
                </div>
              )}
              <h3 className="text-xl font-semibold mb-3">{cta.headline}</h3>
              {cta.description && (
                <p className="text-muted-foreground mb-4">{cta.description}</p>
              )}
              <Button
                className={`${getSizeClass()} ${getBorderRadiusClass()}`}
                style={getButtonStyle()}
              >
                {cta.button_text}
              </Button>
            </div>
          </Card>
        );

      case 'inline_text':
        return (
          <div className="inline-block">
            <Button
              variant="link"
              onClick={handleCTAClick}
              className="p-0 h-auto font-normal text-primary hover:underline"
            >
              {icon && <span className="mr-1">{icon}</span>}
              {cta.button_text}
            </Button>
          </div>
        );

      case 'sidebar_widget':
        return (
          <div 
            className={`p-4 border ${getBorderRadiusClass()}`}
            style={getContainerStyle()}
          >
            <h4 className="font-semibold mb-2">{cta.headline}</h4>
            {cta.description && (
              <p className="text-sm text-muted-foreground mb-3">{cta.description}</p>
            )}
            <Button
              size="sm"
              onClick={handleCTAClick}
              className={`w-full ${getBorderRadiusClass()}`}
              style={getButtonStyle()}
            >
              {icon && <span className="mr-2">{icon}</span>}
              {cta.button_text}
            </Button>
          </div>
        );

      default:
        return (
          <Button
            onClick={handleCTAClick}
            className={`${getSizeClass()} ${getBorderRadiusClass()}`}
            style={getButtonStyle()}
          >
            {icon && <span className="mr-2">{icon}</span>}
            {cta.button_text}
          </Button>
        );
    }
  };

  // Apply custom CSS if provided
  useEffect(() => {
    if (cta.custom_css) {
      const style = document.createElement('style');
      style.textContent = `.cta-${cta.id} { ${cta.custom_css} }`;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, [cta.custom_css, cta.id]);

  return (
    <div 
      className={`cta-component cta-${cta.type} cta-${cta.id} my-6`}
      data-cta-id={cta.id}
      data-placement={cta.placement_position}
    >
      {renderCTAContent()}
    </div>
  );
};