import { Navigate } from "react-router-dom";
import { useAuth } from "@context/AuthContext";

/**
 * Protege por roles. Si no coincide, redirige a /no-autorizado
 * y envía un state opcional { reason } para personalizar el mensaje.
 */
export const RoleRoute = ({
  roles = [],
  children,
  redirectTo = "/no-autorizado",
  reason, // ej: "admin-only"
}) => {
  const { user, loading } = useAuth() || {};

  if (loading) return <div className="p-6 text-white">Cargando…</div>;
  if (!user) return <Navigate to="/login" replace />;

  const allowed = Array.isArray(roles) ? roles : [roles];

  return allowed.includes(user.role)
    ? children
    : <Navigate to={redirectTo} replace state={{ reason }} />;
};
