import { useState } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AddMovement = () => {
  const [form, setForm] = useState({
    type: 'ingreso',
    date: '2025-06-20',
    amount: '',
    frequency: 'nuevo',
    description: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Movimiento agregado:', form);
  };

  const recentMovements = [
    { type: 'ingreso', date: 'Hoy', amount: 300, description: 'Venta gorra negra' },
    { type: 'ingreso', date: 'Ayer', amount: 2100, description: 'Venta pantalón beige talla L' },
    { type: 'egreso', date: '14 Jun', amount: 1700, description: 'Factura' },
    { type: 'ingreso', date: '14 Jun', amount: 700, description: 'Venta medias rojas' },
    { type: 'egreso', date: '9 Jun', amount: 3400, description: 'Renta comercial' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Agregar Movimiento</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-white/5 p-6 rounded-xl space-y-5">
          {/* Tipo de movimiento */}
          <div>
            <label className="block text-sm font-semibold mb-1">¿Qué tipo de movimiento fue?</label>
            <div className="flex flex-col sm:flex-row gap-4 mt-1">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="type"
                  value="ingreso"
                  checked={form.type === 'ingreso'}
                  onChange={handleChange}
                />
                Ingreso
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="type"
                  value="egreso"
                  checked={form.type === 'egreso'}
                  onChange={handleChange}
                />
                Egreso
              </label>
            </div>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-semibold mb-1">Fecha*</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gradientStart"
            />
          </div>

          {/* Valor */}
          <div>
            <label className="block text-sm font-semibold mb-1">Valor del movimiento*</label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="$ 000.000,00"
              className="w-full px-4 py-2 rounded-md bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gradientStart"
            />
          </div>

          {/* Tipo de frecuencia */}
          <div>
            <label className="block text-sm font-semibold mb-1">¿Qué tipo es?*</label>
            <div className="flex flex-col sm:flex-row gap-4 mt-1">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="frequency"
                  value="nuevo"
                  checked={form.frequency === 'nuevo'}
                  onChange={handleChange}
                />
                Nuevo
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="frequency"
                  value="recurrente"
                  checked={form.frequency === 'recurrente'}
                  onChange={handleChange}
                />
                Recurrente
              </label>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-semibold mb-1">Descripción</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Ej: Venta de producto, pago de factura..."
              className="w-full px-4 py-2 rounded-md bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gradientStart"
            />
          </div>

          {/* Botón */}
          <button
            type="submit"
            className="w-full bg-gradientStart hover:bg-gradientMid1 text-white py-2 rounded-md font-semibold transition"
          >
            Agregar {form.type === 'ingreso' ? 'Ingreso' : 'Egreso'}
          </button>

          {/* Nota */}
          <p className="text-xs text-white/60 mt-2">
            Revisa bien la información antes de guardar. Verifica tipo de movimiento, valor, fecha, frecuencia y descripción.
          </p>
        </form>

        {/* Historial reciente */}
        <div className="bg-white/5 p-6 rounded-xl overflow-x-auto">
          <h2 className="text-sm font-semibold mb-4">Movimientos recientes</h2>
          <ul className="space-y-3 text-sm min-w-[300px]">
            {recentMovements.map((item, idx) => (
              <li key={idx} className="flex justify-between items-start">
                <div className={`flex items-center gap-3 ${item.type === 'ingreso' ? 'text-green-400' : 'text-red-400'}`}>
                  {item.type === 'ingreso' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  <div>
                    <p className="font-medium capitalize">{item.type} {item.date}</p>
                    <p className="text-white/70 text-xs">{item.description}</p>
                  </div>
                </div>
                <span className={`font-semibold ${item.type === 'ingreso' ? 'text-green-300' : 'text-red-300'}`}>
                  {item.type === 'egreso' ? '-' : '+'}${item.amount.toLocaleString('es-CO')}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <Link
              to="/dashboard/historial"
              className="inline-flex items-center gap-2 text-sm text-purple-300 hover:underline"
            >
              Ver todo el historial
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
