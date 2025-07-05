import {
  Home,
  BarChart2,
  PlusCircle,
  MessageCircle,
  FileText,
  Bell,
  Settings,
  X,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import logo from '@assets/logo.png';

const navItems = [
  { icon: <Home size={20} />, label: 'Inicio', to: '/dashboard/home' },
  { icon: <BarChart2 size={20} />, label: 'Finanzas', to: '/dashboard/finanzas' },
  { icon: <PlusCircle size={20} />, label: 'Agregar movimientos', to: '/dashboard/agregar-movimiento' },
  { icon: <MessageCircle size={20} />, label: 'ChatBot', to: '/dashboard/chatbot' },
  { icon: <FileText size={20} />, label: 'Historial', to: '/dashboard/historial' },
  { icon: <Bell size={20} />, label: 'Notificaciones', to: '/dashboard/notificaciones' },
  { icon: <Settings size={20} />, label: 'Configuraciones', to: '/dashboard/configuraciones' },
];

export const Navigation = ({ open, setOpen }) => {
  const location = useLocation();

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex h-screen w-60 bg-[#242222] text-white flex-col py-6 px-4 fixed">
        <div className="flex items-center justify-between mb-10">
          <img src={logo} alt="Logo Shain" className="w-7 h-7 object-contain" />
        </div>
        <nav className="flex flex-col gap-6">
          {navItems.map((item, idx) => (
            <Link
              key={idx}
              to={item.to}
              className={`flex items-center gap-3 text-sm transition hover:text-gradientMid1 ${
                location.pathname === item.to ? 'text-gradientMid1 font-semibold' : ''
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Sidebar mobile */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <aside
            className="absolute left-0 top-0 h-full w-60 bg-[#242222] text-white flex flex-col py-6 px-4 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-10">
              <img src={logo} alt="Logo Shain" className="w-7 h-7 object-contain" />
              <button
                className="text-zinc-400 hover:text-white"
                onClick={() => setOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <nav className="flex flex-col gap-6">
              {navItems.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 text-sm transition hover:text-gradientMid1 ${
                    location.pathname === item.to ? 'text-gradientMid1 font-semibold' : ''
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
};
