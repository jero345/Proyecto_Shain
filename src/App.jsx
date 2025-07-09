import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';

// Vistas
import { Login } from '@views/Login';
import { Signup } from '@views/Signup';
import { Home } from '@views/Home';
import { Finance } from '@views/Finance';
import { History } from '@views/History';
import { Notifications } from '@views/Notifications';
import { AddMovement } from '@views/AddMovement';
import { ChatBot } from '@views/ChatBot';
import { Settings } from '@views/Settings';
import { Profile } from '@views/Profile';

// Componentes
import { Navigation } from '@components/Navigation';
import { Navbar } from '@components/Navbar';

// Layout protegido con navegación y barra superior
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

function App() {
  const [open, setOpen] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Rutas protegidas */}
        <Route
          path="/dashboard/home"
          element={
            <ProtectedLayout open={open} setOpen={setOpen}>
              <Home />
            </ProtectedLayout>
          }
        />
        <Route
          path="/dashboard/finanzas"
          element={
            <ProtectedLayout open={open} setOpen={setOpen}>
              <Finance />
            </ProtectedLayout>
          }
        />
        <Route
          path="/dashboard/historial"
          element={
            <ProtectedLayout open={open} setOpen={setOpen}>
              <History />
            </ProtectedLayout>
          }
        />
        <Route
          path="/dashboard/notificaciones"
          element={
            <ProtectedLayout open={open} setOpen={setOpen}>
              <Notifications />
            </ProtectedLayout>
          }
        />
        <Route
          path="/dashboard/agregar-movimiento"
          element={
            <ProtectedLayout open={open} setOpen={setOpen}>
              <AddMovement />
            </ProtectedLayout>
          }
        />
        <Route
          path="/dashboard/chatbot"
          element={
            <ProtectedLayout open={open} setOpen={setOpen}>
              <ChatBot />
            </ProtectedLayout>
          }
        />
        <Route
          path="/dashboard/configuraciones"
          element={
            <ProtectedLayout open={open} setOpen={setOpen}>
              <Settings />
            </ProtectedLayout>
          }
        />
        {/* ✅ Nueva ruta: Perfil */}
        <Route
          path="/dashboard/profile"
          element={
            <ProtectedLayout open={open} setOpen={setOpen}>
              <Profile />
            </ProtectedLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
