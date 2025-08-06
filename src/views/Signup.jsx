import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerRequest } from '@services/authService';
import logo from '@assets/logo.png';
import bgImage from '@assets/fondo.png';
import { User, Mail, Phone, Lock, BadgeCheck } from 'lucide-react';

export const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    lastName: '',
    role: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.acceptedTerms) {
      setError('Debes aceptar los términos y condiciones.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      setLoading(true);
      await registerRequest(form);
      alert('✅ Cuenta creada con éxito');
      navigate('/');
    } catch (error) {
      setError(error.message || '❌ Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex text-white bg-gradient-to-r from-[#3e0b5f] to-[#12002e]">
      {/* Panel izquierdo - Formulario */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-start px-10 py-12 relative bg-[#4B0D69] rounded-r-[30px] shadow-lg">
        <div className="absolute top-0 left-0 w-full h-full bg-[#2b0c4a]/30 rounded-r-[30px] pointer-events-none" />

        <div className="z-10 w-full max-w-md">
          <h1 className="text-4xl font-bold mb-2">Bienvenido</h1>
          <p className="mb-6 text-white/80">Nos alegra verte por aquí</p>

          <h2 className="text-2xl font-bold mb-4">
            Crea tu cuenta <span className="text-[#a58fff]">Shain</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campos */}
            <div className="flex gap-2">
              <input
                name="name"
                placeholder="Nombre"
                value={form.name}
                onChange={handleChange}
                className="w-1/2 bg-white/10 px-4 py-2 rounded placeholder-white/70 focus:outline-none"
              />
              <input
                name="lastName"
                placeholder="Apellido"
                value={form.lastName}
                onChange={handleChange}
                className="w-1/2 bg-white/10 px-4 py-2 rounded placeholder-white/70 focus:outline-none"
              />
            </div>
            <input
              name="role"
              placeholder="Rol"
              value={form.role}
              onChange={handleChange}
              className="w-full bg-white/10 px-4 py-2 rounded placeholder-white/70 focus:outline-none"
            />
            <input
              name="username"
              placeholder="Nombre de usuario"
              value={form.username}
              onChange={handleChange}
              className="w-full bg-white/10 px-4 py-2 rounded placeholder-white/70 focus:outline-none"
            />
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={form.email}
              onChange={handleChange}
              className="w-full bg-white/10 px-4 py-2 rounded placeholder-white/70 focus:outline-none"
            />
            <input
              name="phone"
              placeholder="Teléfono"
              value={form.phone}
              onChange={handleChange}
              className="w-full bg-white/10 px-4 py-2 rounded placeholder-white/70 focus:outline-none"
            />
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={form.password}
              onChange={handleChange}
              className="w-full bg-white/10 px-4 py-2 rounded placeholder-white/70 focus:outline-none"
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirmar Contraseña"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full bg-white/10 px-4 py-2 rounded placeholder-white/70 focus:outline-none"
            />

            {/* Checkbox */}
            <label className="flex items-center gap-2 text-sm mt-2">
              <input
                type="checkbox"
                name="acceptedTerms"
                checked={form.acceptedTerms}
                onChange={handleChange}
                className="accent-pink-500"
              />
              Acepto los{" "}
              <a href="#" className="underline text-pink-400">
                Términos y Condiciones
              </a>
            </label>

            {/* Error */}
            {error && <p className="text-red-400 text-sm">{error}</p>}

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 px-6 py-2 rounded font-semibold w-full mt-2 shadow-lg disabled:opacity-50"
            >
              {loading ? "Creando cuenta..." : "Crear Cuenta"}
            </button>
          </form>

          <p className="text-sm mt-6">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/" className="underline text-pink-400">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>

      {/* Panel derecho con imagen */}
      <div
        className="hidden md:flex md:w-1/2 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute top-0 right-0 p-6">
          <img src={logo} alt="Shain logo" className="h-10" />
        </div>
      </div>
    </div>
  );
};
