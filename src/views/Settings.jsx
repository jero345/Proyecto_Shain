import { useState } from 'react';
import logo from '@assets/logo.png';

export const Settings = () => {
  const [business, setBusiness] = useState({
    name: 'Tienda de ropa SK8',
    goal: '5000',
    type: 'Tienda Ropa',
  });

  const [hours, setHours] = useState({
    lunes: '08:00 - 16:00',
    martes: '08:00 - 16:00',
    miércoles: '08:00 - 16:00',
    jueves: '08:00 - 16:00',
    viernes: '08:00 - 16:00',
    sábado: '08:00 - 16:00',
    domingo: '08:00 - 16:00',
  });

  const modules = [
    'Agenda y Citas',
    'Inventario',
    'Producción',
    'Ventas',
    'Finanzas',
    'Reportes',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBusiness((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-full min-h-screen bg-custom-gradient bg-cover p-6 text-white overflow-x-hidden">
      <h1 className="text-2xl font-bold mb-6">Configuraciones del negocio</h1>

      {/* Información del negocio */}
      <div className="bg-white/5 p-6 rounded-xl mb-6">
        <h2 className="text-lg font-semibold mb-4">Información del negocio</h2>
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="flex flex-col items-center gap-2">
            <img src={logo} alt="Logo" className="w-24 h-24 object-contain rounded-full" />
            <button className="text-sm text-purple-300 hover:underline">Actualizar logo</button>
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Nombre del negocio</label>
              <input
                type="text"
                name="name"
                value={business.name}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-gradientStart"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Meta mensual</label>
              <input
                type="number"
                name="goal"
                value={business.goal}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-gradientStart"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-1">Tipo de negocio</label>
              <input
                type="text"
                name="type"
                value={business.type}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-gradientStart"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Módulos disponibles */}
      <div className="bg-white/5 p-6 rounded-xl mb-6">
        <h2 className="text-lg font-semibold mb-4">Módulos disponibles</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-sm">
          {modules.map((mod, idx) => (
            <div key={idx} className="bg-white/10 px-4 py-2 rounded-md text-white/90">
              {mod}
            </div>
          ))}
        </div>
      </div>

      {/* Horarios de atención */}
      <div className="bg-white/5 p-6 rounded-xl">
        <h2 className="text-lg font-semibold mb-4">Horarios de atención</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          {Object.entries(hours).map(([day, time], idx) => (
            <div key={idx}>
              <label className="block font-medium capitalize mb-1">{day}</label>
              <input
                type="text"
                value={time}
                onChange={(e) =>
                  setHours((prev) => ({ ...prev, [day]: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-md bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-gradientStart"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};