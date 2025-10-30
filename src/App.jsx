import { HashRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@auth/useAuth";
import { ROLES } from "../src/constant/roles";

// 🔐 Guards
import { PrivateRoute } from "@routes/PrivateRoute";
import { RoleRoute } from "@routes/RoleRoute";

// 🧭 Layout
import { Navigation } from "@components/Navigation";
import { Navbar } from "@components/Navbar";

// 🌐 Public views
import { Login } from "@views/Login";
import { Signup } from "@views/Signup";
import { RecoverPassword } from "@views/RecoverPassword";
import ResetPassword from "@auth/ResetPassword";
import { TrialExpired } from "@views/TrialExpired";
import { NotAuthorized } from "@views/NotAuthorized";

// 🔒 Protected views
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
import { CreateTimeslots } from "@views/CreateTimeslots";
import AdminPanel from "@admin/AdminPanel";
import Employees from "@views/Employees";
import EmployeeDetail from "@views/EmployeesDetail"; // ✅ corregido nombre del import

/** 🔓 Bloquea rutas públicas si el usuario ya tiene sesión */
const PublicOnlyRoute = () => {
  const { user } = useAuth();
  if (!user) return <Outlet />;

  return user.role === ROLES.ADMIN
    ? <Navigate to="/portal-admin" replace />
    : <Navigate to="/dashboard/home" replace />;
};

/** 🧱 Shell del dashboard (Navbar + Sidebar + Outlet) */
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
    <Router>
      <Routes>
        {/* ===========================================================
            🌐 RUTAS PÚBLICAS (bloqueadas si hay sesión)
        =========================================================== */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/recuperar-contraseña" element={<RecoverPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* ===========================================================
            🌍 RUTAS PÚBLICAS SIEMPRE DISPONIBLES
        =========================================================== */}
        <Route path="/trial-expired" element={<TrialExpired />} />
        <Route path="/no-autorizado" element={<NotAuthorized />} />

        {/* ===========================================================
            🛠️ ADMIN PANEL
        =========================================================== */}
        <Route
          path="/portal-admin"
          element={
            <PrivateRoute>
              <RoleRoute roles={[ROLES.ADMIN]}>
                <AdminPanel />
              </RoleRoute>
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/referrals"
          element={
            <PrivateRoute>
              <RoleRoute roles={[ROLES.ADMIN]}>
                <AdminReferralPanel />
              </RoleRoute>
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/timeslots"
          element={
            <PrivateRoute>
              <RoleRoute roles={[ROLES.ADMIN]}>
                <CreateTimeslots />
              </RoleRoute>
            </PrivateRoute>
          }
        />

        {/* ===========================================================
            💼 DASHBOARD (OWNER / PROVIDER / ADMIN)
        =========================================================== */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <RoleRoute roles={[ROLES.ADMIN, ROLES.OWNER, ROLES.PROVIDER]}>
                <DashboardShell open={open} setOpen={setOpen} />
              </RoleRoute>
            </PrivateRoute>
          }
        >
          {/* 🔁 Redirección inicial */}
          <Route
            index
            element={
              <RoleRoute roles={[ROLES.ADMIN]}>
                <Navigate to="/portal-admin" replace />
              </RoleRoute>
            }
          />

          {/* 🏠 Home */}
          <Route
            path="home"
            element={
              <RoleRoute roles={[ROLES.PROVIDER, ROLES.OWNER]}>
                <Home />
              </RoleRoute>
            }
          />

          {/* 💰 Finanzas */}
          <Route
            path="finanzas"
            element={
              <RoleRoute roles={[ROLES.PROVIDER, ROLES.OWNER]}>
                <Finance />
              </RoleRoute>
            }
          />
          <Route
            path="agregar-movimiento"
            element={
              <RoleRoute roles={[ROLES.PROVIDER, ROLES.OWNER]}>
                <AddMovement />
              </RoleRoute>
            }
          />
          <Route
            path="historial"
            element={
              <RoleRoute roles={[ROLES.PROVIDER, ROLES.OWNER]}>
                <History />
              </RoleRoute>
            }
          />

          {/* 🔔 Notificaciones / Chat */}
          <Route
            path="notificaciones"
            element={
              <RoleRoute roles={[ROLES.PROVIDER, ROLES.OWNER]}>
                <Notifications />
              </RoleRoute>
            }
          />
          <Route
            path="chatbot"
            element={
              <RoleRoute roles={[ROLES.PROVIDER, ROLES.OWNER]}>
                <ChatBot />
              </RoleRoute>
            }
          />

          {/* 👥 Empleados (solo OWNER) */}
          <Route
            path="employees"
            element={
              <RoleRoute roles={[ROLES.OWNER]}>
                <Employees />
              </RoleRoute>
            }
          />
          <Route
            path="employees/:id"
            element={
              <RoleRoute roles={[ROLES.OWNER]}>
                <EmployeeDetail />
              </RoleRoute>
            }
          />

          {/* 📅 Citas y agenda */}
          <Route
            path="agendar-cita"
            element={
              <RoleRoute roles={[ROLES.PROVIDER, ROLES.OWNER]}>
                <BookAppointment />
              </RoleRoute>
            }
          />
          <Route
            path="citas"
            element={
              <RoleRoute roles={[ROLES.PROVIDER, ROLES.OWNER]}>
                <AppointmentsList />
              </RoleRoute>
            }
          />

          {/* ⚙️ Configuración y perfil */}
          <Route
            path="configuraciones"
            element={
              <RoleRoute roles={[ROLES.ADMIN, ROLES.OWNER]}>
                <Settings />
              </RoleRoute>
            }
          />
          <Route
            path="profile"
            element={
              <RoleRoute roles={[ROLES.ADMIN, ROLES.OWNER, ROLES.PROVIDER]}>
                <Profile />
              </RoleRoute>
            }
          />
          <Route
            path="change-password"
            element={
              <RoleRoute roles={[ROLES.ADMIN, ROLES.OWNER, ROLES.PROVIDER]}>
                <ChangePassword />
              </RoleRoute>
            }
          />

          {/* 🔗 Panel de referidos (solo ADMIN) */}
          <Route
            path="referidos"
            element={
              <RoleRoute roles={[ROLES.ADMIN]}>
                <ReferralPanel />
              </RoleRoute>
            }
          />

          {/* 🚨 Fallback dentro del dashboard */}
          <Route path="*" element={<Navigate to="/dashboard/home" replace />} />
        </Route>

        {/* ===========================================================
            🚨 FALLBACK GLOBAL
        =========================================================== */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
