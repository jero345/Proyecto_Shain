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

import { DefaultLayout } from '@components/DefaultLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/dashboard/home" element={<DefaultLayout><Home /></DefaultLayout>} />
        <Route path="/dashboard/finanzas" element={<DefaultLayout><Finance /></DefaultLayout>} />
        <Route path="/dashboard/historial" element={<DefaultLayout><History /></DefaultLayout>} />
        <Route path="/dashboard/notificaciones" element={<DefaultLayout><Notifications /></DefaultLayout>} />
        <Route path="/dashboard/agregar-movimiento" element={<DefaultLayout><AddMovement /></DefaultLayout>} />
        <Route path="/dashboard/chatbot" element={<DefaultLayout><ChatBot /></DefaultLayout>} />
        <Route path="/dashboard/configuraciones" element={<DefaultLayout><Settings /></DefaultLayout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
