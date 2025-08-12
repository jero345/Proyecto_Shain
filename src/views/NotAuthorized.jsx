import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { useLocation, useNavigate, Link } from "react-router-dom";

export const NotAuthorized = () => {
  const navigate = useNavigate();
  const { state } = useLocation(); // state?.reason

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#a32063] via-[#4b1d69] to-[#0b0b2f] px-6">
      <div className="max-w-lg w-full bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-white/10 border border-white/10">
            <ShieldAlert size={28} className="text-pink-300" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Acceso restringido</h1>
        </div>

        <p className="text-white/80 leading-relaxed mb-6">
          {state?.reason === "admin-only"
            ? "Esta sección solo está disponible para administradores."
            : "Lo sentimos, no tienes permisos para ver esta sección."}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          <span className="px-3 py-1 rounded-full text-xs bg-white/10 border border-white/10">Rol insuficiente</span>
          <span className="px-3 py-1 rounded-full text-xs bg-white/10 border border-white/10">Solicita acceso</span>
          <span className="px-3 py-1 rounded-full text-xs bg-white/10 border border-white/10">Admin requerido</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 transition"
          >
            <ArrowLeft size={18} />
            Volver
          </button>

          <Link
            to="/dashboard/home"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:opacity-90 transition font-semibold"
          >
            <Home size={18} />
            Ir al inicio
          </Link>
        </div>

        <p className="mt-6 text-xs text-white/60">
          Código de error: <span className="font-mono">403</span>
        </p>
      </div>
    </div>
  );
};

export default NotAuthorized;
