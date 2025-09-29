// src/routes/RoleRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import { normalizeRole } from "../constant/roles";

/** Protege por roles. Si no coincide, redirige a /no-autorizado */
export const RoleRoute = ({
  roles = [],
  children,
  redirectTo = "/no-autorizado",
  reason, // ej: "admin-only"
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="p-6 text-white">Cargando…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  const userRole = normalizeRole(user.role);
  const allowed = (Array.isArray(roles) ? roles : [roles]).includes(userRole);

  return allowed
    ? children
    : <Navigate to={redirectTo} replace state={{ reason, from: location.pathname }} />;
};

export default RoleRoute;
