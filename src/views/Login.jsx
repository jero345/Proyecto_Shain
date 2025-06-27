import { Link } from 'react-router-dom';
import loginImage from '@assets/fondo.png';
import logo from '@assets/logo.png';

export const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-custom-gradient px-4">
      <div className="flex flex-col lg:flex-row w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl bg-white/5 backdrop-blur-md">

        {/* Lado izquierdo: formulario */}
        <div className="relative w-full lg:w-1/2 p-8 sm:p-12 text-white bg-gradient-to-br from-gradientMid2 to-gradientMid1">
          {/* Curva decorativa */}
          <div className="absolute inset-0 bg-purple-600 rounded-br-[80%] lg:rounded-tr-full opacity-10 z-0" />

          <div className="relative z-10">
            <h2 className="text-4xl font-extrabold mb-2">Bienvenido</h2>
            <p className="mb-6 text-sm text-purple-200">Nos alegra verte otra vez</p>

            <h3 className="text-xl font-semibold mb-4">Vamos a iniciar sesión</h3>

            <form className="space-y-4">
              {/* Usuario */}
              <div>
                <label className="text-sm font-semibold">Usuario</label>
                <input
                  type="text"
                  placeholder="Ingresa tu usuario"
                  className="w-full mt-1 px-4 py-2 rounded-md bg-white/10 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-gradientStart"
                />
              </div>

              {/* Contraseña */}
              <div>
                <label className="text-sm font-semibold">Contraseña</label>
                <input
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  className="w-full mt-1 px-4 py-2 rounded-md bg-white/10 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-gradientStart"
                />
                <a
                  href="#"
                  className="text-xs text-purple-300 hover:underline mt-1 inline-block"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              {/* Recordarme */}
              <div className="flex items-center gap-2">
                <input type="checkbox" id="remember" className="accent-gradientStart" />
                <label htmlFor="remember" className="text-sm">Recordarme</label>
              </div>

              {/* Botón */}
              <button
                type="submit"
                className="w-full bg-gradientStart hover:bg-gradientMid1 text-white py-2 rounded-md font-semibold transition"
              >
                Iniciar Sesión
              </button>
            </form>

            {/* Link a crear cuenta */}
            <p className="text-xs mt-6 text-purple-200">
              ¿No tienes una cuenta?{" "}
              <Link to="/signup" className="underline text-purple-300 hover:text-purple-100">
                Crear cuenta
              </Link>
            </p>
          </div>
        </div>

        {/* Lado derecho: imagen + logo alineado a la derecha */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <img
            src={loginImage}
            alt="Imagen login"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-8 right-8 z-10">
            <img
              src={logo}
              alt="Logo"
              className="w-48 h-48 object-contain drop-shadow-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
};