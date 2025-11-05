import React from 'react';
import { TemplateManagement } from '@/components/cta/TemplateManagement';
import RoleProtectedRoute from '@/components/RoleProtectedRoute';

const TemplatesDashboard: React.FC = () => {
  return (
    <RoleProtectedRoute requiredRole="super_admin">
      <div className="container mx-auto py-6">
        <TemplateManagement />
      </div>
    </RoleProtectedRoute>
  );
};

export default TemplatesDashboard;