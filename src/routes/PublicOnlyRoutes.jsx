// src/routes/PublicOnlyRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import { ROLES } from "../src/constant/roles";

export const PublicOnlyRoute = () => {
  const { user } = useAuth();
  if (!user) return <Outlet />;

  return user.role === ROLES.ADMIN
    ? <Navigate to="/portal-admin" replace />
    : <Navigate to="/dashboard/home" replace />;
};

export default PublicOnlyRoute;
