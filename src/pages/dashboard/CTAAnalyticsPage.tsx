import React from 'react';
import { CTAAnalyticsDashboard } from '@/components/cta/CTAAnalyticsDashboard';
import RoleProtectedRoute from '@/components/RoleProtectedRoute';

const CTAAnalyticsPage: React.FC = () => {
  return (
    <RoleProtectedRoute requiredRole="super_admin">
      <CTAAnalyticsDashboard />
    </RoleProtectedRoute>
  );
};

export default CTAAnalyticsPage;