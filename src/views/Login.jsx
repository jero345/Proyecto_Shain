import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@auth/useAuth';
import { loginRequest } from '@services/authService';
import { ROLES } from '../constant/roles';
import loginImage from '@assets/fondo.png';
import logo from '@assets/logo.png';

/** Permite activar cookie fallback NO httpOnly solo para pruebas si lo necesitas */
function readEnv(key, fallback) {
  try { if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key] !== undefined) return import.meta.env[key]; } catch {}
  try { if (typeof window !== 'undefined' && window.__env && window.__env[key] !== undefined) return window.__env[key]; } catch {}
  try { if (typeof process !== 'undefined' && process.env && process.env[key] !== undefined) return process.env[key]; } catch {}
  return fallback;
}
const ALLOW_FALLBACK_COOKIE = String(readEnv('VITE_ALLOW_FALLBACK_COOKIE', 'false')).toLowerCase() === 'true';

export const Login = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const loginUser = auth?.loginUser || (() => {});
  const user = auth?.user ?? null;

  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.role === ROLES.ADMIN) navigate('/portal-admin', { replace: true });
    else navigate('/dashboard/home', { replace: true });
  }, [user, navigate]);

  const handleChange = (e) => {
    setCredentials(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const res = await loginRequest(credentials);
      // res: { status, data, token }
      const status = String(res?.status ?? 'success').toLowerCase();

      if (!['success', 'ok', '200'].includes(status)) {
        const serverMsg = res?.data?.message || 'Login fallido';
        throw new Error(serverMsg);
      }

      const token = res?.token || null;
      const userInfo =
        res?.data?.data ?? // algunos backends anidan en data.data
        res?.data?.user ?? // o data.user
        res?.data ?? null;

      if (!token && ALLOW_FALLBACK_COOKIE) {
        // SOLO pruebas en túneles: crea una cookie accesible al cliente
        try {
          document.cookie = `token_shain=fallback-${Date.now()}; path=/; SameSite=None; Secure`;
          console.warn('[login] cookie fallback creada (SOLO PRUEBAS). No usar en producción.');
        } catch {}
      }

      try { loginUser(userInfo, token ?? null); } catch (err) { /* noop */ }

      const role =
        userInfo?.role ||
        userInfo?.user?.role ||
        (typeof userInfo === 'object' ? userInfo?.role : undefined);

      if (role === ROLES.ADMIN) navigate('/portal-admin', { replace: true });
      else navigate('/dashboard/home', { replace: true });

      // Debug útil: confirma que el token quedó en localStorage para el chatbot (opción B)
      // console.log('[login] token_shain:', localStorage.getItem('token_shain'));

    } catch (err) {
      console.error('Login error:', err);
      if (err?.response?.status === 403) {
        navigate('/trial-expired');
      } else {
        const backendMsg = err?.response?.data?.message || err?.message || 'Usuario o contraseña incorrectos.';
        alert(`❌ ${backendMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-custom-gradient">
      <div className="flex flex-col lg:flex-row w-full max-w-6xl overflow-hidden rounded-3xl shadow-2xl bg-white/5 backdrop-blur-md">
        <div className="relative w-full lg:w-1/2 p-6 sm:p-10 md:p-12 text-white bg-gradient-to-br from-gradientMid2 to-gradientMid1">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-2">Bienvenido</h2>
          <p className="text-sm text-purple-200 mb-6">Nos alegra verte otra vez</p>

          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div>
              <label className="block font-semibold">Usuario</label>
              <input
                name="username"
                value={credentials.username}
                onChange={handleChange}
                placeholder="Ingresa tu usuario"
                className="w-full mt-1 px-4 py-2 rounded-md bg-white/10 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-gradientStart"
                required
              />
            </div>

            <div>
              <label className="block font-semibold">Contraseña</label>
              <input
                name="password"
                type="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder="Ingresa tu contraseña"
                className="w-full mt-1 px-4 py-2 rounded-md bg-white/10 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-gradientStart"
                required
              />
              <Link to="/recuperar-contraseña" className="text-xs text-purple-300 hover:underline mt-1 inline-block">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-md bg-gradientStart hover:bg-gradientMid1 font-semibold transition"
            >
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <p className="mt-6 text-sm text-purple-200 text-center">
            ¿No tienes una cuenta?{' '}
            <Link to="/signup" className="text-purple-300 underline hover:text-white transition">
              Crear cuenta
            </Link>
          </p>
        </div>

        <div className="hidden lg:block lg:w-1/2 relative">
          <img src={loginImage} alt="Imagen login" className="w-full h-full object-cover" />
          <div className="absolute top-8 right-8 z-10">
            <img src={logo} alt="Logo Shain" className="w-24 h-24 object-contain drop-shadow-md" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
