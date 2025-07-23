// src/views/Signup.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerRequest } from '@services/authService';

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
    <form onSubmit={handleSubmit} className="p-6 space-y-4 text-white">
      <h2 className="text-2xl font-bold">Crear cuenta</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input name="name" placeholder="Nombre" value={form.name} onChange={handleChange} className="input" />
        <input name="lastName" placeholder="Apellido" value={form.lastName} onChange={handleChange} className="input" />
        <input name="role" placeholder="Rol" value={form.role} onChange={handleChange} className="input" />
        <input name="username" placeholder="Usuario" value={form.username} onChange={handleChange} className="input" />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="input" />
        <input name="phone" placeholder="Teléfono" value={form.phone} onChange={handleChange} className="input" />
        <input type="password" name="password" placeholder="Contraseña" value={form.password} onChange={handleChange} className="input" />
        <input type="password" name="confirmPassword" placeholder="Confirmar contraseña" value={form.confirmPassword} onChange={handleChange} className="input" />
      </div>
      <label className="flex items-center gap-2">
        <input type="checkbox" name="acceptedTerms" checked={form.acceptedTerms} onChange={handleChange} />
        Acepto los términos y condiciones
      </label>
      <button type="submit" className="bg-gradientStart px-4 py-2 rounded">Registrarse</button>
    </form>
  );
};
