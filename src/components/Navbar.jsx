// src/components/Navbar.jsx
import { Plus, User as UserIcon, LogOut, Loader2 } from "lucide-react";
import appLogo from "@assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useMemo, useState, useCallback } from "react";
import { useAuth } from "@context/AuthContext";

export const Navbar = ({ setOpen }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [imgError, setImgError] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  // ✅ Handler de logout con protección contra múltiples clicks
  const handleLogout = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Evitar múltiples clicks
    if (isLoggingOut) {
      console.log("[Navbar] Logout ya en progreso, ignorando click");
      return;
    }
    
    setIsLoggingOut(true);
    console.log("[Navbar] Iniciando logout...");
    
    try {
      await logout();
    } catch (err) {
      console.error("[Navbar] Error en logout:", err);
      // Forzar redirección si falla
      window.location.href = "/#/login";
    }
    // No reseteamos isLoggingOut porque la página va a cambiar de todos modos
  }, [logout, isLoggingOut]);

  return (
    <header className="w-full bg-[#242222] shadow px-4 py-3 flex items-center justify-between fixed top-0 z-50">
      {/* Logo app + menú móvil */}
      <div className="flex items-center space-x-2">
        <img src={appLogo} alt="Logo Shain" className="w-32 h-12 object-contain" loading="lazy" />
        <button className="block lg:hidden" onClick={() => setOpen?.(true)} aria-label="Abrir menú">
          <Plus className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Acciones */}
      <div className="flex items-center space-x-4">
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

        {/* ✅ Botón de logout con protección */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`flex items-center gap-1 transition ${
            isLoggingOut 
              ? "text-gray-500 cursor-not-allowed" 
              : "text-gray-300 hover:text-red-400"
          }`}
          title={isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
        >
          {isLoggingOut ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <LogOut className="w-5 h-5" />
          )}
          <span className="hidden md:inline text-xs">
            {isLoggingOut ? "Saliendo..." : "Salir"}
          </span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;