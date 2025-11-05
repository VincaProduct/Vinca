import React from 'react';
import { CTAPlacementDashboard } from '@/components/cta/CTAPlacementDashboard';
import RoleProtectedRoute from '@/components/RoleProtectedRoute';

const CTAPlacementPage: React.FC = () => {
  return (
    <RoleProtectedRoute requiredRole="super_admin">
      <CTAPlacementDashboard />
    </RoleProtectedRoute>
  );
};

export default CTAPlacementPage;