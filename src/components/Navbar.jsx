import { useState } from "react";
import { Plus, Bell, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logo from "@assets/logo.png";
import { navItems } from "@constants/navigation";

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Accesos rápidos actualizados
  const quickAccess = navItems.filter(item =>
    [
      "Agregar movimientos",
      "Historial",
      "Finanzas",
      "Notificaciones",
      "Configuraciones",
      "ChatBot"
    ].includes(item.label)
  );

  return (
    <header className="w-full bg-[#242222] shadow px-4 py-3 flex items-center justify-between fixed top-0 z-50">
      
      {/* Logo + botón + menú */}
      <div className="flex items-center gap-3 relative">
        <img
          src={logo}
          alt="Logo Shain"
          className="w-28 h-10 object-contain"
        />

        {/* Botón funcional al lado del logo */}
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
                    location.pathname === item.to ? "text-blue-600 font-semibold" : ""
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

      {/* Texto al centro */}
      <div className="hidden md:block text-sm text-white">
        Hola Sebastián, este es tu resumen de 24 abr 2025
      </div>

      {/* Notificaciones y avatar */}
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