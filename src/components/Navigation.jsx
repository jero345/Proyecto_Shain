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
  { icon: <MessageCircle size={20} />, label: 'ChatBot', to: '#' },
  { icon: <FileText size={20} />, label: 'Historial', to: '/dashboard/historial' },
  { icon: <Bell size={20} />, label: 'Notificaciones', to: '/dashboard/notificaciones' },
  { icon: <Settings size={20} />, label: 'Configuraciones', to: '#' },
];

export const Navigation = () => {
  const location = useLocation();

  return (
    <aside className="h-screen w-60 bg-[#242222] text-white flex flex-col py-6 px-4 fixed">
      {/* Encabezado con logo */}
      <div className="flex items-center justify-between mb-10">
        <img src={logo} alt="Logo Shain" className="w-7 h-7 object-contain" />
        <button className="text-zinc-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      {/* Navegación */}
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
  );
};