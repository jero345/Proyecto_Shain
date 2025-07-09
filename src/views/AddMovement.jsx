import { useState, useEffect } from 'react';
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

  const [recentMovements, setRecentMovements] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('movements')) || [];
    setRecentMovements(saved);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newMovement = { ...form, amount: Number(form.amount) };
    const updatedMovements = [newMovement, ...recentMovements];
    setRecentMovements(updatedMovements);
    localStorage.setItem('movements', JSON.stringify(updatedMovements));
    setForm({ type: 'ingreso', date: '', amount: '', frequency: 'nuevo', description: '' });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-10 text-white">
      <h1 className="text-3xl font-bold mb-2">Agregar Movimiento</h1>
      <p className="text-white/70 mb-8 max-w-2xl">
        Genera movimientos para llevar el control de ingresos y egresos en caja, registrando cada transacción con su valor, tipo y descripción.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="bg-gradient-to-br from-gradientStart via-gradientMid2 to-gradientEnd p-8 rounded-xl border border-white/10 backdrop-blur-md space-y-6"
        >
          {/* Tabs Ingreso/Egreso */}
          <div className="flex gap-4">
            {['ingreso', 'egreso'].map((type) => (
              <button
                type="button"
                key={type}
                onClick={() => setForm((prev) => ({ ...prev, type }))}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition ${
                  form.type === type
                    ? type === 'ingreso'
                      ? 'bg-green-600 text-white'
                      : 'bg-red-600 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fecha */}
            <div>
              <label className="block text-sm mb-1">Fecha*</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md bg-white/10 text-white placeholder-white/50"
              />
            </div>

            {/* Tipo Frecuencia */}
            <div>
              <label className="block text-sm mb-1">¿Qué tipo es?*</label>
              <div className="flex items-center gap-4 mt-2">
                {['nuevo', 'recurrente'].map((freq) => (
                  <button
                    type="button"
                    key={freq}
                    onClick={() => setForm((prev) => ({ ...prev, frequency: freq }))}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                      form.frequency === freq
                        ? 'bg-white/20 border-white text-white'
                        : 'bg-transparent border-white/30 text-white/60 hover:border-white/50'
                    }`}
                  >
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Valor */}
          <div>
            <label className="block text-sm mb-1">Valor del movimiento*</label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="$ 000.000,00"
              className="w-full px-4 py-2 rounded-md bg-white/10 text-white placeholder-white/50"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm mb-1">Descripción</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Ej: Venta de producto, pago de factura..."
              className="w-full px-4 py-2 rounded-md bg-white/10 text-white placeholder-white/50"
            />
          </div>

          {/* Botón */}
          <button
            type="submit"
            className={`w-full py-2 rounded-md text-white font-semibold transition ${
              form.type === 'ingreso' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            Agregar {form.type === 'ingreso' ? 'Ingreso' : 'Egreso'}
          </button>

          <p className="text-xs text-white/60 mt-4">
            Revisa bien la información antes de guardar el movimiento.
          </p>
        </form>

        {/* Movimientos recientes */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Movimientos recientes</h2>
            <Link to="/dashboard/historial" className="text-sm underline text-white/70 hover:text-white">
              Ver todo el historial
            </Link>
          </div>
          <ul className="space-y-4">
            {recentMovements.map((item, idx) => (
              <li
                key={idx}
                className="flex justify-between items-center bg-white/5 rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.type === 'ingreso' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  >
                    {item.type === 'ingreso' ? (
                      <ArrowUpRight size={16} />
                    ) : (
                      <ArrowDownRight size={16} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium capitalize">{item.type}</p>
                    <p className="text-xs text-white/70">{item.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      item.type === 'ingreso' ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {item.type === 'egreso' ? '-' : '+'}${item.amount.toLocaleString('es-CO')}
                  </p>
                  <p className="text-xs text-white/60">{item.date}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
