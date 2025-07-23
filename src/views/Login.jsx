import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@auth/useAuth';
import { loginRequest } from '@services/authService';

import loginImage from '@assets/fondo.png';
import logo from '@assets/logo.png';

export const Login = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await loginRequest(credentials);
      if (res.status === 'success') {
        loginUser(res.data);
        navigate('/dashboard/home');
      }
    } catch (err) {
      alert('❌ Usuario o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-custom-gradient">
      <div className="flex flex-col lg:flex-row w-full max-w-6xl overflow-hidden rounded-3xl shadow-2xl bg-white/5 backdrop-blur-md">
        
        {/* Formulario */}
        <div className="relative w-full lg:w-1/2 p-6 sm:p-10 md:p-12 text-white bg-gradient-to-br from-gradientMid2 to-gradientMid1">
          <div className="absolute inset-0 bg-purple-600 rounded-br-[80%] lg:rounded-tr-full opacity-10 z-0" />
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-2">Bienvenido</h2>
            <p className="text-sm text-purple-200 mb-6">Nos alegra verte otra vez</p>

            <h3 className="text-lg sm:text-xl font-semibold mb-4">Vamos a iniciar sesión</h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              {/* Usuario */}
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

              {/* Contraseña */}
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
                <Link to="/recuperar" className="text-xs text-purple-300 hover:underline mt-1 inline-block">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Recordarme */}
              <div className="flex items-center gap-2">
                <input type="checkbox" id="remember" className="accent-gradientStart" />
                <label htmlFor="remember" className="text-sm">Recordarme</label>
              </div>

              {/* Botón */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 rounded-md bg-gradientStart hover:bg-gradientMid1 font-semibold transition"
              >
                {loading ? 'Iniciando...' : 'Iniciar Sesión'}
              </button>
            </form>

            <p className="text-xs mt-6 text-purple-200">
              ¿No tienes una cuenta?{" "}
              <Link to="/signup" className="underline text-purple-300 hover:text-purple-100">
                Crear cuenta
              </Link>
            </p>
          </div>
        </div>

        {/* Imagen lateral */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <img
            src={loginImage}
            alt="Imagen login"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-8 right-8 z-10">
            <img
              src={logo}
              alt="Logo Shain"
              className="w-24 h-24 object-contain drop-shadow-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
