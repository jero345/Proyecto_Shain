import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerRequest } from '@services/authService';
import logo from '@assets/logo.png';
import bgImage from '@assets/fondo.png';

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.acceptedTerms) return alert('Debes aceptar los términos');
    if (form.password !== form.confirmPassword) return alert('Contraseñas no coinciden');

    try {
      await registerRequest(form);
      alert('Cuenta creada con éxito');
      navigate('/');
    } catch (error) {
      alert(error.message || 'Error al registrar');
    }
  };

  return (
    <div className="min-h-screen w-full flex text-white bg-gradient-to-r from-[#3e0b5f] to-[#12002e]">
      {/* Panel izquierdo - Formulario */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-start px-10 py-12 relative bg-[#4B0D69] rounded-r-[30px]">
        <div className="absolute top-0 left-0 w-full h-full bg-[#2b0c4a]/30 rounded-r-[30px] pointer-events-none" />

        <div className="z-10 w-full max-w-md">
          <h1 className="text-4xl font-bold mb-2">Bienvenido</h1>
          <p className="mb-6">Nos alegra verte por aquí</p>

          <h2 className="text-2xl font-bold mb-4">Crea tu cuenta <span className="text-[#a58fff]">Shain</span></h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input name="name" placeholder="Nombre" value={form.name} onChange={handleChange}
              className="w-full bg-white/10 px-4 py-2 rounded placeholder-white/70" />
            <input name="lastName" placeholder="Apellido" value={form.lastName} onChange={handleChange}
              className="w-full bg-white/10 px-4 py-2 rounded placeholder-white/70" />
            <input name="role" placeholder="Rol" value={form.role} onChange={handleChange}
              className="w-full bg-white/10 px-4 py-2 rounded placeholder-white/70" />
            <input name="username" placeholder="Nombre de usuario" value={form.username} onChange={handleChange}
              className="w-full bg-white/10 px-4 py-2 rounded placeholder-white/70" />
            <input name="email" placeholder="Correo electrónico" value={form.email} onChange={handleChange}
              className="w-full bg-white/10 px-4 py-2 rounded placeholder-white/70" />
            <input name="phone" placeholder="Teléfono" value={form.phone} onChange={handleChange}
              className="w-full bg-white/10 px-4 py-2 rounded placeholder-white/70" />
            <input type="password" name="password" placeholder="Contraseña" value={form.password} onChange={handleChange}
              className="w-full bg-white/10 px-4 py-2 rounded placeholder-white/70" />
            <input type="password" name="confirmPassword" placeholder="Confirmar Contraseña" value={form.confirmPassword} onChange={handleChange}
              className="w-full bg-white/10 px-4 py-2 rounded placeholder-white/70" />

            <label className="flex items-center gap-2 text-sm mt-2">
              <input type="checkbox" name="acceptedTerms" checked={form.acceptedTerms} onChange={handleChange} />
              Acepto los <a href="#" className="underline text-white">Términos y Condiciones</a>
            </label>

            <button type="submit" className="bg-orange-600 hover:bg-orange-700 px-6 py-2 rounded font-semibold w-full mt-2">
              Crear Cuenta
            </button>
          </form>

          <p className="text-sm mt-6">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/" className="underline text-white">Inicia sesión</Link>
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
