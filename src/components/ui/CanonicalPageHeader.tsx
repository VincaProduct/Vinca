import React from 'react';
import { Button } from '@/components/ui/button';

// CanonicalPageHeader: Use this everywhere for page headers
// Props:
// - title: string (main heading)
// - actions?: React.ReactNode (optional right-side actions/buttons)
// - children?: React.ReactNode (optional extra content below title)
// - mobileActionButton?: React.ReactNode (optional fixed mobile button)

interface CanonicalPageHeaderProps {
  title: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  mobileActionButton?: React.ReactNode;
}

const CanonicalPageHeader: React.FC<CanonicalPageHeaderProps> = ({
  title,
  actions,
  children,
  mobileActionButton,
}) => (
  <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border-b -mx-3 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8 mb-6 sm:mb-8">
    <div className="max-w-6xl mx-auto py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          {children}
        </div>
        {actions && (
          <div className="hidden md:block">{actions}</div>
        )}
      </div>
      {mobileActionButton && (
        <div className="block md:hidden">{mobileActionButton}</div>
      )}
    </div>
  </div>
);

export default CanonicalPageHeader;
