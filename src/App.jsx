import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from '@views/Login';
import { Signup } from '@views/Signup';
import { Home } from '@views/Home';
import { Finance } from '@views/Finance';
import { History } from '@views/History';
import { Notifications } from '@views/Notifications';
import { AddMovement } from '@views/AddMovement';
import { ChatBot } from '@views/ChatBot'; // 👈 Importación nueva

import { Navigation } from '@components/Navigation';
import { Navbar } from '@components/Navbar';

// Layout protegido con navegación y barra superior
function ProtectedLayout({ children }) {
  return (
    <>
      <Navbar />
      <div className="flex">
        <Navigation />
        <main className="ml-60 min-h-screen w-full bg-gray-50 dark:bg-gray-900 p-4 pt-16 overflow-x-hidden">
          {children}
        </main>
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Rutas protegidas */}
        <Route path="/dashboard/home" element={<ProtectedLayout><Home /></ProtectedLayout>} />
        <Route path="/dashboard/finanzas" element={<ProtectedLayout><Finance /></ProtectedLayout>} />
        <Route path="/dashboard/historial" element={<ProtectedLayout><History /></ProtectedLayout>} />
        <Route path="/dashboard/notificaciones" element={<ProtectedLayout><Notifications /></ProtectedLayout>} />
        <Route path="/dashboard/agregar-movimiento" element={<ProtectedLayout><AddMovement /></ProtectedLayout>} />
        <Route path="/dashboard/chatbot" element={<ProtectedLayout><ChatBot /></ProtectedLayout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;