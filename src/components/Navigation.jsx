import {
  Home,
  BarChart2,
  PlusCircle,
  MessageCircle,
  FileText,
  Bell,
  Settings as SettingsIcon,
  X,
  CalendarClock,
  ClipboardList,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { useAuth } from "@context/AuthContext";
import logo from "@assets/logo.png";

const ROLES = {
  ADMIN: "admin",
  OWNER: "propietario_negocio",
  BARBERO: "barbero",
};

const ALL_ITEMS = [
  // barbero + owner
  { icon: <Home size={20} />, label: "Inicio", to: "/dashboard/home", roles: [ROLES.BARBERO, ROLES.OWNER] },
  { icon: <BarChart2 size={20} />, label: "Finanzas", to: "/dashboard/finanzas", roles: [ROLES.BARBERO, ROLES.OWNER] },
  { icon: <PlusCircle size={20} />, label: "Agregar movimientos", to: "/dashboard/agregar-movimiento", roles: [ROLES.BARBERO, ROLES.OWNER] },
  { icon: <MessageCircle size={20} />, label: "ShainBot", to: "/dashboard/chatbot", roles: [ROLES.BARBERO, ROLES.OWNER] },
  { icon: <FileText size={20} />, label: "Historial", to: "/dashboard/historial", roles: [ROLES.BARBERO, ROLES.OWNER] },
  { icon: <Bell size={20} />, label: "Notificaciones", to: "/dashboard/notificaciones", roles: [ROLES.BARBERO, ROLES.OWNER] },

  // solo barbero (citas)
  { icon: <CalendarClock size={20} />, label: "Agendar Citas", to: "/dashboard/agendar-cita", roles: [ROLES.BARBERO] },
  { icon: <ClipboardList size={20} />, label: "Citas Agendadas", to: "/dashboard/citas", roles: [ROLES.BARBERO] },

  // config para todos
  { icon: <SettingsIcon size={20} />, label: "Configuraciones", to: "/dashboard/configuraciones", roles: [ROLES.ADMIN, ROLES.OWNER, ROLES.BARBERO] },

  // solo admin
  { icon: <ShieldCheck size={20} />, label: "Portal Admin", to: "/portal-admin", roles: [ROLES.ADMIN] },
  { icon: <Users size={20} />, label: "Referidos", to: "/dashboard/referidos", roles: [ROLES.ADMIN] },
];

export const Navigation = ({ open, setOpen }) => {
  const location = useLocation();
  const { user } = useAuth() || {};
  const role = user?.role;

  const navItems = useMemo(
    () => ALL_ITEMS.filter((item) => role && item.roles.includes(role)),
    [role]
  );

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex h-screen w-60 bg-[#242222] text-white flex-col py-6 px-4 fixed">
        <div className="flex items-center justify-between mb-10">
          <img src={logo} alt="Logo Shain" className="w-7 h-7 object-contain" />
        </div>
        <nav className="flex flex-col gap-6">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 text-sm transition hover:text-gradientMid1 ${
                isActive(item.to) ? "text-gradientMid1 font-semibold" : ""
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <aside
            className="absolute left-0 top-0 h-full w-60 bg-[#242222] text-white flex flex-col py-6 px-4 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-10">
              <img src={logo} alt="Logo Shain" className="w-7 h-7 object-contain" />
              <button className="text-zinc-400 hover:text-white" onClick={() => setOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <nav className="flex flex-col gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 text-sm transition hover:text-gradientMid1 ${
                    isActive(item.to) ? "text-gradientMid1 font-semibold" : ""
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
