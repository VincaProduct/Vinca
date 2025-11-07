import React, { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCTAAnalytics } from '@/hooks/useCTAs';
import type { CTAWithPlacement } from '@/types/cta';

interface SimpleCTAComponentProps {
  cta: CTAWithPlacement;
  blogPostId: string;
}

export const SimpleCTAComponent: React.FC<SimpleCTAComponentProps> = ({ cta, blogPostId }) => {
  const navigate = useNavigate();
  const { trackCTAEvent } = useCTAAnalytics();
  const ctaRef = useRef<HTMLDivElement>(null);
  const hasTrackedView = useRef(false);

  // Track CTA view when it becomes visible using Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTrackedView.current) {
            hasTrackedView.current = true;
            trackCTAEvent({
              cta_id: cta.id,
              blog_post_id: blogPostId,
              event_type: 'view'
            });
          }
        });
      },
      {
        threshold: 0.5, // CTA must be 50% visible to count as a view
        rootMargin: '0px 0px -50px 0px' // Add some bottom margin to ensure proper visibility
      }
    );

    if (ctaRef.current) {
      observer.observe(ctaRef.current);
    }

    return () => {
      if (ctaRef.current) {
        observer.unobserve(ctaRef.current);
      }
    };
  }, [cta.id, blogPostId, trackCTAEvent]);

  const handleCTAClick = useCallback(() => {
    // Track click event
    trackCTAEvent({
      cta_id: cta.id,
      blog_post_id: blogPostId,
      event_type: 'click'
    });

    // Redirect all CTAs to auth page
    navigate('/auth');
  }, [cta.id, blogPostId, trackCTAEvent, navigate]);

  if (cta.type === 'button') {
    return (
      <div ref={ctaRef} className="cta-container flex flex-col items-center space-y-4 text-center max-w-md mx-auto">
        <h3 className="text-xl font-bold text-foreground leading-tight">{cta.headline}</h3>
        {cta.description && (
          <p className="text-muted-foreground leading-relaxed">{cta.description}</p>
        )}
        <Button 
          onClick={handleCTAClick} 
          className="cta-button-enhanced min-w-[200px] h-12 text-base font-semibold"
          size="lg"
        >
          {cta.button_text}
        </Button>
      </div>
    );
  }

  if (cta.type === 'banner') {
    return (
      <div ref={ctaRef} className="cta-container cta-banner w-full">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex-1 text-center lg:text-left">
            <h3 className="text-xl font-bold text-foreground mb-3 leading-tight">{cta.headline}</h3>
            {cta.description && (
              <p className="text-muted-foreground leading-relaxed">{cta.description}</p>
            )}
          </div>
          <div className="flex-shrink-0">
            <Button 
              onClick={handleCTAClick} 
              className="cta-button-enhanced min-w-[180px] h-12 text-base font-semibold"
              size="lg"
            >
              {cta.button_text}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (cta.type === 'card') {
    return (
      <Card ref={ctaRef} className="cta-card-elevated max-w-sm mx-auto border-0">
        <CardContent className="p-8 text-center space-y-6">
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-foreground leading-tight">{cta.headline}</h3>
            {cta.description && (
              <p className="text-muted-foreground leading-relaxed">{cta.description}</p>
            )}
          </div>
          <Button 
            onClick={handleCTAClick} 
            className="cta-button-enhanced w-full h-12 text-base font-semibold"
            size="lg"
          >
            {cta.button_text}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
};