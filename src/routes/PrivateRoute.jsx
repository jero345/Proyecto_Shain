// src/routes/PrivateRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import { useEffect, useState } from "react";
import { axiosApi } from "@services/axiosclient";

export const PrivateRoute = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const checkTrial = async () => {
      try {
        const res = await axiosApi.get("/auth/check-trial", { withCredentials: true });
        if (res.data?.trialExpired) {
          setExpired(true);
          await logout();
        }
      } catch {
        // silencioso
      } finally {
        setChecking(false);
      }
    };
    checkTrial();
  }, [logout]);

  if (checking) return <div className="text-center mt-20 text-white">⏳ Verificando acceso...</div>;

  if (!user || expired) {
    return (
      <Navigate
        to={expired ? "/trial-expired" : "/login"}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
};

export default PrivateRoute;
