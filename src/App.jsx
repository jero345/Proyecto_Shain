// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useState } from "react";

// Guards
import { PrivateRoute } from "@routes/PrivateRoute";
import { RoleRoute } from "@routes/RoleRoute";

// Layout
import { Navigation } from "@components/Navigation";
import { Navbar } from "@components/Navbar";

// Public views
import { Login } from "@views/Login";
import { Signup } from "@views/Signup";
import { RecoverPassword } from "@views/RecoverPassword";
import ResetPassword from "@auth/ResetPassword"; // ← nueva vista para cambiar contraseña
import { TrialExpired } from "@views/TrialExpired";
import { NotAuthorized } from "@views/NotAuthorized";

// Protected views
import { Home } from "@views/Home";
import { Finance } from "@views/Finance";
import { History } from "@views/History";
import { Notifications } from "@views/Notifications";
import { AddMovement } from "@views/AddMovement";
import { ChatBot } from "@views/ChatBot";
import { Settings } from "@views/Settings";
import { Profile } from "@views/Profile";
import { BookAppointment } from "@views/BookAppointment";
import { ChangePassword } from "@views/ChangePassword";
import { AppointmentsList } from "@views/AppointmentsList";
import { ReferralPanel } from "@views/ReferralPanel";
import { AdminReferralPanel } from "@views/AdminReferralPanel";
import AdminPanel from "@admin/AdminPanel";
import { CreateTimeslots } from "@views/CreateTimeslots";

import { useAuth } from "@auth/useAuth";

const ROLES = {
  ADMIN: "admin",
  OWNER: "propietario_negocio",
  BARBERO: "barbero",
};

/** Rutas públicas que se bloquean si ya hay sesión */
const PublicOnlyRoute = () => {
  const { user } = useAuth();
  if (!user) return <Outlet />;

  return user.role === ROLES.ADMIN
    ? <Navigate to="/portal-admin" replace />
    : <Navigate to="/dashboard/home" replace />;
};

/** Shell del dashboard para evitar repetir layout en rutas protegidas */
function DashboardShell({ open, setOpen }) {
  return (
    <>
      <Navbar setOpen={setOpen} />
      <div className="flex">
        <Navigation open={open} setOpen={setOpen} />
        <main className="ml-0 lg:ml-60 min-h-screen w-full bg-gray-50 dark:bg-gray-900 p-4 pt-16 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default function App() {
  const [open, setOpen] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        {/** ===================== PÚBLICAS (bloqueadas si hay sesión) ===================== */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/recuperar-contraseña" element={<RecoverPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} /> {/* ← NUEVA */}
        </Route>

        {/** ===================== PÚBLICAS SIEMPRE DISPONIBLES ===================== */}
        <Route path="/trial-expired" element={<TrialExpired />} />
        <Route path="/no-autorizado" element={<NotAuthorized />} />

        {/** ===================== PORTAL ADMIN (SOLO ADMIN) ===================== */}
        <Route
          path="/portal-admin"
          element={
            <PrivateRoute>
              <RoleRoute roles={[ROLES.ADMIN]} reason="admin-only">
                <AdminPanel />
              </RoleRoute>
            </PrivateRoute>
          }
        />

        {/** Admin: referidos fuera del dashboard */}
        <Route
          path="/admin/referrals"
          element={
            <PrivateRoute>
              <RoleRoute roles={[ROLES.ADMIN]} reason="admin-only">
                <AdminReferralPanel />
              </RoleRoute>
            </PrivateRoute>
          }
        />

        {/** Admin: crear horarios (timeslots) */}
        <Route
          path="/admin/timeslots"
          element={
            <PrivateRoute>
              <RoleRoute roles={[ROLES.ADMIN]} reason="admin-only">
                <CreateTimeslots />
              </RoleRoute>
            </PrivateRoute>
          }
        />

        {/** ===================== DASHBOARD (PROTEGIDO + LAYOUT ÚNICO) ===================== */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <RoleRoute roles={[ROLES.ADMIN, ROLES.OWNER, ROLES.BARBERO]}>
                <DashboardShell open={open} setOpen={setOpen} />
              </RoleRoute>
            </PrivateRoute>
          }
        >
          {/** Si un ADMIN entra a /dashboard, lo mandamos al portal de admin */}
          <Route
            index
            element={
              <RoleRoute roles={[ROLES.ADMIN]}>
                <Navigate to="/portal-admin" replace />
              </RoleRoute>
            }
          />

          {/** Home por defecto para barbero/owner */}
          <Route
            path="home"
            element={
              <RoleRoute roles={[ROLES.BARBERO, ROLES.OWNER]}>
                <Home />
              </RoleRoute>
            }
          />

          <Route
            path="finanzas"
            element={
              <RoleRoute roles={[ROLES.BARBERO, ROLES.OWNER]}>
                <Finance />
              </RoleRoute>
            }
          />

          <Route
            path="agregar-movimiento"
            element={
              <RoleRoute roles={[ROLES.BARBERO, ROLES.OWNER]}>
                <AddMovement />
              </RoleRoute>
            }
          />

          <Route
            path="chatbot"
            element={
              <RoleRoute roles={[ROLES.BARBERO, ROLES.OWNER]}>
                <ChatBot />
              </RoleRoute>
            }
          />

          <Route
            path="historial"
            element={
              <RoleRoute roles={[ROLES.BARBERO, ROLES.OWNER]}>
                <History />
              </RoleRoute>
            }
          />

          <Route
            path="notificaciones"
            element={
              <RoleRoute roles={[ROLES.BARBERO, ROLES.OWNER]}>
                <Notifications />
              </RoleRoute>
            }
          />

          {/** Citas: solo barbero */}
          <Route
            path="agendar-cita"
            element={
              <RoleRoute roles={[ROLES.BARBERO]}>
                <BookAppointment />
              </RoleRoute>
            }
          />
          <Route
            path="citas"
            element={
              <RoleRoute roles={[ROLES.BARBERO]}>
                <AppointmentsList />
              </RoleRoute>
            }
          />

          {/** Configuración / Perfil (todos los roles) */}
          <Route
            path="configuraciones"
            element={
              <RoleRoute roles={[ROLES.ADMIN, ROLES.OWNER, ROLES.BARBERO]}>
                <Settings />
              </RoleRoute>
            }
          />
          <Route
            path="profile"
            element={
              <RoleRoute roles={[ROLES.ADMIN, ROLES.OWNER, ROLES.BARBERO]}>
                <Profile />
              </RoleRoute>
            }
          />
          <Route
            path="change-password"
            element={
              <RoleRoute roles={[ROLES.ADMIN, ROLES.OWNER, ROLES.BARBERO]}>
                <ChangePassword />
              </RoleRoute>
            }
          />

          {/** Dentro del dashboard: referidos solo admin */}
          <Route
            path="referidos"
            element={
              <RoleRoute roles={[ROLES.ADMIN]} reason="admin-only">
                <ReferralPanel />
              </RoleRoute>
            }
          />

          {/** Fallback del dashboard */}
          <Route path="*" element={<Navigate to="/dashboard/home" replace />} />
        </Route>

        {/** ===================== FALLBACK GLOBAL ===================== */}
        <Route path="/dashboard/*" element={<Navigate to="/dashboard/home" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
