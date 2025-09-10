// src/routes/PublicOnlyRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@auth/useAuth';
import { ROLES } from '@constants/roles';

export const PublicOnlyRoute = () => {
  const { user } = useAuth();
  if (!user) return <Outlet />;
  return user.role === ROLES.ADMIN
    ? <Navigate to="/portal-admin" replace />
    : <Navigate to="/dashboard/home" replace />;
};


