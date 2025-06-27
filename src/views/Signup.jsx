import React, { useState } from 'react';
import fondo from '@assets/fondo.png'; // asegúrate de que la ruta sea correcta

export const Signup = () => {
  const [form, setForm] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Formulario enviado:', form);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-custom-gradient px-4">
      <div className="flex flex-col lg:flex-row w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl bg-white/5 backdrop-blur-md">

        {/* Lado izquierdo con formulario */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 text-white bg-gradient-to-br from-gradientMid2 to-gradientMid1">
          <h2 className="text-4xl font-extrabold mb-2">Bienvenido</h2>
          <p className="mb-6 text-sm text-purple-200">Nos alegra verte otra vez</p>
          <h3 className="text-2xl font-bold mb-6">
            Crea tu cuenta <span className="text-purple-400">Shain</span><br />
            <span className="text-lg font-medium text-purple-300">
              Hacerlo es fácil, solo completa los siguientes datos
            </span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Ingresa tu correo electrónico"
                  className="w-full px-4 py-2 rounded-md bg-white/10 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-gradientStart"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Número telefónico</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Ingresa tu número telefónico"
                  className="w-full px-4 py-2 rounded-md bg-white/10 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-gradientStart"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Contraseña</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Crea tu contraseña"
                  className="w-full px-4 py-2 rounded-md bg-white/10 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-gradientStart"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Confirmar Contraseña</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirma tu contraseña"
                  className="w-full px-4 py-2 rounded-md bg-white/10 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-gradientStart"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                name="acceptedTerms"
                checked={form.acceptedTerms}
                onChange={handleChange}
                className="accent-gradientStart"
              />
              <label>
                Acepto los <a href="#" className="underline text-purple-200">Términos y Condiciones</a>
              </label>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto bg-gradientStart hover:bg-gradientMid1 text-white py-2 px-6 rounded-md font-semibold transition mt-4"
            >
              Crear Cuenta
            </button>
          </form>
        </div>

        {/* Lado derecho: imagen decorativa */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <img
            src={fondo}
            alt="Imagen decorativa"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};