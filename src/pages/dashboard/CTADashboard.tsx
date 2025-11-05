import React from 'react';
import { CTADashboard } from '@/components/cta/CTADashboard';
import RoleProtectedRoute from '@/components/RoleProtectedRoute';

const CTADashboardPage: React.FC = () => {
  return (
    <RoleProtectedRoute requiredRole="super_admin">
      <CTADashboard />
    </RoleProtectedRoute>
  );
};

export default CTADashboardPage;