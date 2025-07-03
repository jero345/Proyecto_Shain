import {
  Home,
  BarChart2,
  PlusCircle,
  MessageCircle,
  FileText,
  Bell,
  Settings,
} from 'lucide-react';

export const navItems = [
  { icon: <Home size={20} />, label: 'Inicio', to: '/dashboard/home' },
  { icon: <BarChart2 size={20} />, label: 'Finanzas', to: '/dashboard/finanzas' },
  { icon: <PlusCircle size={20} />, label: 'Agregar movimientos', to: '/dashboard/agregar-movimiento' },
  { icon: <MessageCircle size={20} />, label: 'ChatBot', to: '/dashboard/chatbot' },
  { icon: <FileText size={20} />, label: 'Historial', to: '/dashboard/historial' },
  { icon: <Bell size={20} />, label: 'Notificaciones', to: '/dashboard/notificaciones' },
  { icon: <Settings size={20} />, label: 'Configuraciones', to: '/dashboard/configuraciones' },
];