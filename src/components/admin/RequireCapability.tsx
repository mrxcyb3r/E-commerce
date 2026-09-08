import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { can, Capability } from '../../lib/admin/permissions';
import { ForbiddenPage } from '../../pages/admin/ForbiddenPage';

// Page-level capability gate. Lives INSIDE AdminRoute, so "unauthenticated"
// is already handled (→ /login). Here we only distinguish:
//   AUTHENTICATED BUT UNAUTHORIZED → 403 Forbidden page (never a login loop).
//
// Relies on RLS as the actual security boundary: this component just stops
// unauthorized users from seeing/using a page, it cannot escalate anything.
export const RequireCapability: React.FC<{
  capability: Capability;
  children: React.ReactNode;
}> = ({ capability, children }) => {
  const { user } = useAuth();

  if (!can(user?.role, capability)) {
    return <ForbiddenPage />;
  }

  return <>{children}</>;
};

export const Cap = RequireCapability;