// src/routes/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@auth/useAuth';
import { useEffect, useState } from 'react';
import { axiosInstance } from '@services/axiosclient';

export const PrivateRoute = ({ children }) => {
  const { user, logoutUser } = useAuth();
  const [checking, setChecking] = useState(true);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const checkTrial = async () => {
      try {
        const res = await axiosInstance.get('/auth/check-trial', { withCredentials: true });
        if (res.data?.trialExpired) {
          setExpired(true);
          logoutUser(); // opcional: limpiar datos de usuario
        }
      } catch (error) {
        console.error("Error verificando el trial:", error);
      } finally {
        setChecking(false);
      }
    };
    checkTrial();
  }, []);

  if (checking) return <div className="text-center mt-20">⏳ Verificando acceso...</div>;

  if (!user || expired) {
    return <Navigate to={expired ? "/trial-expired" : "/"} replace />;
  }

  return children;
};
