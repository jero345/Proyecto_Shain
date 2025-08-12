// src/components/Navbar.jsx
import { Bell, Plus, User as UserIcon, LogOut } from "lucide-react";
import appLogo from "@assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAuth } from "@context/AuthContext";

export const Navbar = ({ setOpen }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [imgError, setImgError] = useState(false);

  const name = useMemo(() => {
    if (!user) return "Usuario";
    if (user?.name && user?.lastName) return `${user.name} ${user.lastName}`;
    return user?.name || user?.username || "Usuario";
  }, [user]);

  const initials = useMemo(() => {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "U";
  }, [name]);

  // 1) logo desde contexto, 2) logo cacheado de business en localStorage, 3) null
  const cachedBusiness = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("business")) || null;
    } catch {
      return null;
    }
  }, []);

  const rawLogo =
    user?.logoUrl ||
    cachedBusiness?.image ||
    null;

  const avatarSrc = rawLogo
    ? `${rawLogo}${user?.logoUpdatedAt ? `?v=${user.logoUpdatedAt}` : ""}`
    : null;

  const formattedDate = new Date().toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="w-full bg-[#242222] shadow px-4 py-3 flex items-center justify-between fixed top-0 z-50">
      {/* Logo app + menú móvil */}
      <div className="flex items-center space-x-2">
        <img src={appLogo} alt="Logo Shain" className="w-32 h-12 object-contain" loading="lazy" />
        <button className="block lg:hidden" onClick={() => setOpen?.(true)} aria-label="Abrir menú">
          <Plus className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Saludo */}
      <div className="hidden md:block text-sm text-white">
        Hola {name}, este es tu resumen de {formattedDate}
      </div>

      {/* Acciones */}
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate("/dashboard/notificaciones")} className="relative" title="Notificaciones">
          <Bell className="w-5 h-5 text-gray-300" />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* Avatar: logo si hay; si falla, iniciales; si no, ícono */}
        {avatarSrc && !imgError ? (
          <button
            onClick={() => navigate("/dashboard/profile")}
            className="w-9 h-9 rounded-full overflow-hidden hover:ring-2 hover:ring-white/50 transition"
            title="Mi perfil"
          >
            <img
              src={avatarSrc}
              alt="Avatar"
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </button>
        ) : (
          <button
            onClick={() => navigate("/dashboard/profile")}
            className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center hover:ring-2 hover:ring-white/50 transition"
            title="Mi perfil"
          >
            {initials ? (
              <span className="text-xs font-semibold text-[#242222]">{initials}</span>
            ) : (
              <UserIcon className="w-4 h-4 text-white" />
            )}
          </button>
        )}

        <button
          onClick={logout}
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
