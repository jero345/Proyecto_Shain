import {
  Home,
  BarChart3,
  PlusCircle,
  Clock,
  Bell,
  Bot,
  Settings,
} from "lucide-react";

export const navItems = [
  {
    label: "Home",
    to: "/dashboard/home",
    icon: <Home size={16} />,
  },
  {
    label: "Agregar movimientos",
    to: "/dashboard/agregar-movimiento",
    icon: <PlusCircle size={16} />,
  },
  {
    label: "Finanzas",
    to: "/dashboard/finanzas",
    icon: <BarChart3 size={16} />,
  },
  {
    label: "Historial",
    to: "/dashboard/historial",
    icon: <Clock size={16} />,
  },
  {
    label: "Notificaciones",
    to: "/dashboard/notificaciones",
    icon: <Bell size={16} />,
  },
  {
    label: "ChatBot",
    to: "/dashboard/chatbot",
    icon: <Bot size={16} />,
  },
  {
    label: "Configuraciones",
    to: "/dashboard/configuraciones",
    icon: <Settings size={16} />,
  },
];