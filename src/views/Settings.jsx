import { useState, useEffect } from 'react';
import logo from '@assets/logo.png';

export const Settings = () => {
  const [business, setBusiness] = useState({
    name: '',
    goal: '',
    type: '',
  });

  const [hours, setHours] = useState({
    lunes: '',
    martes: '',
    miércoles: '',
    jueves: '',
    viernes: '',
    sábado: '',
    domingo: '',
  });

  const [activeModules, setActiveModules] = useState([]);

  const modules = [
    { name: 'Agenda y Citas', icon: '📅' },
    { name: 'Inventario', icon: '📦' },
    { name: 'Producción', icon: '🏭' },
    { name: 'Ventas', icon: '💼' },
    { name: 'Finanzas', icon: '💰' },
    { name: 'Reportes', icon: '📄' },
  ];

  useEffect(() => {
    const savedBusiness = JSON.parse(localStorage.getItem('business')) || {
      name: 'Tienda de ropa SK8',
      goal: '5000',
      type: 'Tienda Ropa',
    };
    const savedHours = JSON.parse(localStorage.getItem('hours')) || {
      lunes: '08:00 - 16:00',
      martes: '08:00 - 16:00',
      miércoles: '08:00 - 16:00',
      jueves: '08:00 - 16:00',
      viernes: '08:00 - 16:00',
      sábado: '08:00 - 16:00',
      domingo: '08:00 - 16:00',
    };
    const savedModules = JSON.parse(localStorage.getItem('activeModules')) || [];

    setBusiness(savedBusiness);
    setHours(savedHours);
    setActiveModules(savedModules);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBusiness((prev) => ({ ...prev, [name]: value }));
  };

  const toggleModule = (mod) => {
    setActiveModules((prev) =>
      prev.includes(mod)
        ? prev.filter((m) => m !== mod)
        : [...prev, mod]
    );
  };

  const handleHourChange = (day, value) => {
    setHours((prev) => ({ ...prev, [day]: value }));
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-10 text-white space-y-8">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm font-semibold text-white/70">
        ⚙️ <span>Notificaciones</span>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Información del negocio</h1>
        <button className="bg-[#ff5a00] hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-full">
          Guardar Cambios
        </button>
      </div>

      <p className="text-white/60 mb-4">
        Actualiza la información principal de tu negocio
      </p>

      <div className="flex flex-col md:flex-row md:justify-between gap-10">
        {/* Logo + Info */}
        <div className="flex flex-col gap-4">
          <img
            src={logo}
            alt="Logo"
            className="w-44 h-44 object-contain bg-white rounded-md p-4"
          />
          <button className="text-sm underline text-white/80 hover:text-white">
            Actualizar logo
          </button>
        </div>

        {/* Campos */}
        <div className="flex-1 flex flex-col gap-4">
          <div>
            <label className="block text-sm mb-1">Nombre del negocio*</label>
            <input
              type="text"
              name="name"
              value={business.name}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md bg-[#0b0f19] border border-white/10 text-white placeholder-white/50"
              placeholder="Nombre del negocio"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Meta mensual*</label>
            <input
              type="text"
              name="goal"
              value={`$${Number(business.goal).toLocaleString()}`}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md bg-[#0b0f19] border border-white/10 text-white placeholder-white/50"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Tipo de negocio*</label>
            <input
              type="text"
              name="type"
              value={business.type}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md bg-[#0b0f19] border border-white/10 text-white placeholder-white/50"
              disabled
            />
          </div>
        </div>

        {/* Módulos */}
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-2">Módulos disponibles</h2>
          <p className="text-white/60 mb-4">
            Gestiona los módulos que desees tener activos para tu negocio
          </p>
          <div className="space-y-3">
            {modules.map((mod) => (
              <div key={mod.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{mod.icon}</span>
                  <span>{mod.name}</span>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeModules.includes(mod.name)}
                    onChange={() => toggleModule(mod.name)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-600 rounded-full peer peer-checked:bg-purple-600 transition"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Horarios */}
      <div className="bg-[#0b0f19] p-6 rounded-xl">
        <h2 className="text-xl font-bold mb-2">Horarios de atención</h2>
        <p className="text-white/60 mb-4">
          Edita los horarios de atención de tu negocio a tu preferencia
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(hours).map(([day, value]) => (
            <div key={day} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-10 h-5 bg-gray-600 rounded-full peer-checked:bg-purple-600 transition"></div>
                </label>
                <span className="font-bold capitalize">{day}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value="08:00hr"
                  disabled
                  className="px-3 py-1 rounded-md bg-[#0b0f19] border border-white/10 text-white text-sm"
                />
                <span className="text-sm">hasta las</span>
                <input
                  type="text"
                  value="16:00hr"
                  disabled
                  className="px-3 py-1 rounded-md bg-[#0b0f19] border border-white/10 text-white text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
