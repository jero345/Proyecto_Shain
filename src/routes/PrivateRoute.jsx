// src/routes/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@context/AuthContext";
import { axiosInstance } from "@services/axiosclient";

export const PrivateRoute = ({ children }) => {
  const { user, logout } = useAuth();
  const [checking, setChecking] = useState(true);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const checkTrial = async () => {
      try {
        const res = await axiosInstance.get("/auth/check-trial", { withCredentials: true });
        if (res.data?.trialExpired) {
          setExpired(true);
          await logout(); // limpia y redirige
        }
      } catch (error) {
        console.error("Error verificando el trial:", error);
      } finally {
        setChecking(false);
      }
    };
    checkTrial();
  }, [logout]);

  if (checking) return <div className="text-center mt-20">⏳ Verificando acceso...</div>;
  if (!user || expired) return <Navigate to={expired ? "/trial-expired" : "/"} replace />;

  return children;
};
