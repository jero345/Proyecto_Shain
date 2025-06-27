import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from '@views/Login';
import { Signup } from '@views/Signup';
import { Home } from '@views/Home';
import { Finance } from '@views/Finance'; // 👈 Asegúrate de tener este archivo

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
        <Route
          path="/dashboard/home"
          element={
            <ProtectedLayout>
              <Home />
            </ProtectedLayout>
          }
        />
        <Route
          path="/dashboard/finanzas"
          element={
            <ProtectedLayout>
              <Finance />
            </ProtectedLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;