import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from '@views/Login';
import { Signup } from '@views/Signup';
import { Home } from '@views/Home';
import { Finance } from '@views/Finance';
import { History } from '@views/History';
import { Notifications } from '@views/Notifications';
import { AddMovement } from '@views/AddMovement';
import { ChatBot } from '@views/ChatBot';
import { Settings } from '@views/Settings';

import { Navigation } from '@components/Navigation';
import { Navbar } from '@components/Navbar';

// Layout protegido con navegación y barra superior
function ProtectedLayout({ children }) {
  return (
    <>
      <Navbar />
      <div className="relative flex">
        <Navigation />
        <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 md:ml-72 overflow-x-hidden">
          <main className="w-full h-full">{children}</main>
        </div>
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
        <Route path="/dashboard/configuraciones" element={<ProtectedLayout><Settings /></ProtectedLayout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;