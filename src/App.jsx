import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';

// Context
import AuthProvider from '@context/AuthProvider';
import { PrivateRoute } from '@routes/PrivateRoute';

// Layout components
import { Navigation } from '@components/Navigation';
import { Navbar } from '@components/Navbar';

// Public views
import { Login } from '@views/Login';
import { Signup } from '@views/Signup';
import { RecoverPassword } from '@views/RecoverPassword';
import { TrialExpired } from '@views/TrialExpired';

// Protected views
import { Home } from '@views/Home';
import { Finance } from '@views/Finance';
import { History } from '@views/History';
import { Notifications } from '@views/Notifications';
import { AddMovement } from '@views/AddMovement';
import { ChatBot } from '@views/ChatBot';
import { Settings } from '@views/Settings';
import { Profile } from '@views/Profile';
import { BookAppointment } from '@views/BookAppointment';
import { ChangePassword } from '@views/ChangePassword';
import { AppointmentsList } from '@views/AppointmentsList';
import { ReferralPanel } from '@views/ReferralPanel';
import { AdminReferralPanel } from '@views/AdminReferralPanel';



// Admin view
import AdminPanel from '@admin/AdminPanel';

// Layout wrapper for dashboard
function ProtectedLayout({ children, open, setOpen }) {
  return (
    <>
      <Navbar setOpen={setOpen} />
      <div className="flex">
        <Navigation open={open} setOpen={setOpen} />
        <main className="ml-0 lg:ml-60 min-h-screen w-full bg-gray-50 dark:bg-gray-900 p-4 pt-16 overflow-x-hidden">
          {children}
        </main>
      </div>
    </>
  );
}

// App main
function App() {
  const [open, setOpen] = useState(false);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/recuperar-contraseña" element={<RecoverPassword />} />
          <Route path="/trial-expired" element={<TrialExpired />} />
          <Route path="/dashboard" element={<Navigate to="/dashboard/home" replace />} />
          <Route path="/admin/referrals" element={<AdminReferralPanel />} />

          {/* Protected routes */}
          <Route
            path="/dashboard/home"
            element={
              <PrivateRoute>
                <ProtectedLayout open={open} setOpen={setOpen}>
                  <Home />
                </ProtectedLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/finanzas"
            element={
              <PrivateRoute>
                <ProtectedLayout open={open} setOpen={setOpen}>
                  <Finance />
                </ProtectedLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/historial"
            element={
              <PrivateRoute>
                <ProtectedLayout open={open} setOpen={setOpen}>
                  <History />
                </ProtectedLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/notificaciones"
            element={
              <PrivateRoute>
                <ProtectedLayout open={open} setOpen={setOpen}>
                  <Notifications />
                </ProtectedLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/agregar-movimiento"
            element={
              <PrivateRoute>
                <ProtectedLayout open={open} setOpen={setOpen}>
                  <AddMovement />
                </ProtectedLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/chatbot"
            element={
              <PrivateRoute>
                <ProtectedLayout open={open} setOpen={setOpen}>
                  <ChatBot />
                </ProtectedLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/configuraciones"
            element={
              <PrivateRoute>
                <ProtectedLayout open={open} setOpen={setOpen}>
                  <Settings />
                </ProtectedLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/profile"
            element={
              <PrivateRoute>
                <ProtectedLayout open={open} setOpen={setOpen}>
                  <Profile />
                </ProtectedLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/recuperar-contrasena"
            element={
              <PrivateRoute>
                <ProtectedLayout open={open} setOpen={setOpen}>
                  <ChangePassword />
                </ProtectedLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/citas"
            element={
              <PrivateRoute>
                <ProtectedLayout open={open} setOpen={setOpen}>
                  <AppointmentsList />
                </ProtectedLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/agendar-cita"
            element={
              <PrivateRoute>
                <ProtectedLayout open={open} setOpen={setOpen}>
                  <BookAppointment />
                </ProtectedLayout>
              </PrivateRoute>
            }
          />

          {/* NUEVO: Panel de referidos */}
          <Route
            path="/dashboard/referidos"
            element={
              <PrivateRoute>
                <ProtectedLayout open={open} setOpen={setOpen}>
                  <ReferralPanel />
                </ProtectedLayout>
              </PrivateRoute>
            }
          />

          {/* Panel de administración */}
          <Route
            path="/portal-admin"
            element={
              <PrivateRoute>
                <AdminPanel />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
