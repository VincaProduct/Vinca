import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SimpleCTAPreviewProps {
  type?: string;
  headline?: string;
  description?: string;
  buttonText?: string;
}

export const SimpleCTAPreview: React.FC<SimpleCTAPreviewProps> = ({
  type = 'button',
  headline = 'Your Headline Here',
  description = '',
  buttonText = 'Click Here'
}) => {
  if (type === 'button') {
    return (
      <div className="flex flex-col items-center space-y-4 p-6 bg-muted/30 rounded-lg">
        <h3 className="text-lg font-semibold text-center">{headline}</h3>
        {description && (
          <p className="text-sm text-muted-foreground text-center">{description}</p>
        )}
        <Button className="px-6 py-2">
          {buttonText}
        </Button>
      </div>
    );
  }

  if (type === 'banner') {
    return (
      <div className="w-full p-6 bg-primary/10 border border-primary/20 rounded-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">{headline}</h3>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <Button className="px-6 py-2">
            {buttonText}
          </Button>
        </div>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <Card className="max-w-sm mx-auto">
        <CardContent className="p-6 text-center space-y-4">
          <h3 className="text-lg font-semibold">{headline}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          <Button className="w-full">
            {buttonText}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="text-center py-8 text-muted-foreground">
      Select a CTA type to see preview
    </div>
  );
};