// src/routes/PrivateRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@context/AuthContext";

/**
 * PrivateRoute - Protege rutas que requieren autenticación
 * Simple y directo - el manejo del 401 lo hace axios
 */
export const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la sesión
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#1e1b4b]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-purple-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin"></div>
          </div>
          <p className="text-white/70 text-sm">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si hay usuario, mostrar contenido
  if (user) {
    return children;
  }

  // Si no hay usuario, redirigir a login
  // Guardamos la ruta actual para redirigir después del login
  return <Navigate to="/login" replace state={{ from: location.pathname }} />;
};

export default PrivateRoute;