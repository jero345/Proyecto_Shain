import { Bell, Plus, User, LogOut } from "lucide-react";
import logo from "@assets/logo.png";
import { useNavigate } from "react-router-dom";

export const Navbar = ({ setOpen }) => {
  const navigate = useNavigate();

  // ✅ Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  // ✅ Ir a perfil
  const goToProfile = () => {
    navigate('/dashboard/profile');
  };

  // ✅ Ir a notificaciones
  const goToNotifications = () => {
    navigate('/dashboard/notificaciones');
  };

  return (
    <header className="w-full bg-[#242222] shadow px-4 py-3 flex items-center justify-between fixed top-0 z-50">
      {/* Logo + Botón menú mobile */}
      <div className="flex items-center space-x-2">
        <img
          src={logo}
          alt="Logo Shain"
          className="w-32 h-12 object-contain"
        />
        <button
          className="block lg:hidden"
          onClick={() => setOpen(true)}
        >
          <Plus className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Saludo */}
      <div className="hidden md:block text-sm text-white">
        Hola Sebastián, este es tu resumen de 24 abr 2025
      </div>

      {/* Acciones derecha */}
      <div className="flex items-center space-x-4">
        {/* ✅ Bell clickable */}
        <button
          onClick={goToNotifications}
          className="relative"
          title="Notificaciones"
        >
          <Bell className="w-5 h-5 text-gray-300" />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        {/* Avatar clickable para perfil */}
        <button
          onClick={goToProfile}
          className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center hover:ring-2 hover:ring-white/50 transition"
          title="Mi perfil"
        >
          <User className="w-4 h-4 text-white" />
        </button>

        {/* Botón cerrar sesión */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-gray-300 hover:text-red-400 transition"
          title="Cerrar sesión"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden md:inline text-xs">Salir</span>
        </button>
      </div>
    </header>
  );
};
