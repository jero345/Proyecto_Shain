import { Bell, Plus, User } from "lucide-react";
import logo from "@assets/logo.png"; // Asegúrate de esta ruta correcta

export const Navbar = () => {
  return (
    <header className="w-full bg-[#242222] shadow px-4 py-3 flex items-center justify-between fixed top-0 z-50">
      {/* Logo a la izquierda con tamaño mayor */}
      <div className="flex items-center space-x-2">
        <img
          src={logo}
          alt="Logo Shain"
          className="w-32 h-12 object-contain"
        />
        <Plus className="w-4 h-4 text-gray-400" />
      </div>

      {/* Saludo centrado */}
      <div className="hidden md:block text-sm text-white">
        Hola Sebastian, este es tu resumen de 24 abr 2025
      </div>

      {/* Notificación + Avatar */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Bell className="w-5 h-5 text-gray-300" />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
        </div>
        <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
      </div>
    </header>
  );
};