import { useState } from "react";
import { Plus, Bell, User, Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logo from "@assets/logo.png";
import { navItems } from "@constants/navigation";

export const Navbar = ({ onToggleMenu }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Filtra accesos rápidos
  const quickAccess = navItems.filter((item) =>
    [
      "Agregar movimientos",
      "Historial",
      "Finanzas",
      "Notificaciones",
      "Configuraciones",
      "ChatBot",
    ].includes(item.label)
  );

  return (
    <header
      className="
        fixed top-0 left-0 right-0 z-50 
        bg-[#242222] shadow px-4 py-3 
        flex items-center justify-between
        md:pl-72
      "
    >
      {/* Botón toggle sidebar (SOLO MOBILE) + Logo + Quick Access */}
      <div className="flex items-center gap-3 relative">
        {/* Toggle sidebar */}
        <button
          onClick={onToggleMenu}
          className="md:hidden p-1 text-white hover:scale-105 transition"
          aria-label="Abrir menú lateral"
        >
          <Menu size={24} />
        </button>

        {/* Logo */}
        <img
          src={logo}
          alt="Logo Shain"
          className="w-28 h-10 object-contain"
        />

        {/* Botón acceso rápido */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-400 via-purple-500 to-indigo-600 shadow-md flex items-center justify-center hover:scale-105 transition"
          >
            <Plus size={18} className="text-white" />
          </button>

          {menuOpen && (
            <div className="absolute left-0 top-full mt-2 w-56 bg-white text-gray-900 rounded-md shadow-lg overflow-hidden text-sm z-50">
              {quickAccess.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 hover:bg-gray-100 ${
                    location.pathname === item.to
                      ? "text-blue-600 font-semibold"
                      : ""
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Texto central solo en escritorio */}
      <div className="hidden md:block text-sm text-white">
        Hola Sebastián, este es tu resumen de 24 abr 2025
      </div>

      {/* Notificación y avatar */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Bell className="w-5 h-5 text-gray-300" />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
        </div>
        <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
      </div>
    </header>
  );
};
