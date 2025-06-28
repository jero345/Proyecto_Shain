import { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react';

const mockMovements = [
  {
    id: 1,
    type: 'ingreso',
    date: 'Hoy',
    description: 'Venta gorra negra',
    amount: 300,
  },
  {
    id: 2,
    type: 'ingreso',
    date: 'Ayer',
    description: 'Venta pantalón beige talla L',
    amount: 2100,
  },
  {
    id: 3,
    type: 'egreso',
    date: '14 Jun',
    description: 'Factura',
    amount: -1700,
  },
  {
    id: 4,
    type: 'ingreso',
    date: '14 Jun',
    description: 'Venta medias rojas',
    amount: 700,
  },
  {
    id: 5,
    type: 'egreso',
    date: '14 Jun',
    description: 'Factura',
    amount: -1700,
  },
];

export const History = () => {
  const [filterType, setFilterType] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMovements = mockMovements.filter((item) => {
    const matchesType =
      filterType === 'todos' || item.type === filterType;
    const matchesSearch = item.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="w-full min-h-screen bg-slate-950 bg-cover p-6 text-white overflow-x-hidden">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Movimientos recientes</h1>
        </div>
        <button className="flex items-center gap-2 bg-gradientStart hover:bg-gradientMid1 px-4 py-2 rounded-md text-sm font-medium transition">
          <Plus size={16} /> Agregar Movimiento
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2 text-sm">
          <button
            onClick={() => setFilterType('todos')}
            className={`px-4 py-1.5 rounded-md transition ${
              filterType === 'todos'
                ? 'bg-white/20 text-white font-semibold'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            Ver Todos
          </button>
          <button
            onClick={() => setFilterType('ingreso')}
            className={`px-4 py-1.5 rounded-md transition ${
              filterType === 'ingreso'
                ? 'bg-green-500/30 text-green-200 font-semibold'
                : 'bg-green-500/20 hover:bg-green-500/30 text-green-300'
            }`}
          >
            Ver Ingresos
          </button>
          <button
            onClick={() => setFilterType('egreso')}
            className={`px-4 py-1.5 rounded-md transition ${
              filterType === 'egreso'
                ? 'bg-red-500/30 text-red-200 font-semibold'
                : 'bg-red-500/20 hover:bg-red-500/30 text-red-300'
            }`}
          >
            Ver Egresos
          </button>
        </div>

        <input
          type="text"
          placeholder="Buscar movimiento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-64 px-4 py-2 rounded-md bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gradientStart"
        />
      </div>

      {/* Lista de movimientos */}
      <div className="bg-white/5 rounded-xl p-4">
        <h3 className="text-sm font-semibold mb-4">Resultados</h3>
        {filteredMovements.length === 0 ? (
          <p className="text-sm text-white/60">No se encontraron movimientos.</p>
        ) : (
          <ul className="space-y-3 text-sm">
            {filteredMovements.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-start"
              >
                <div
                  className={`flex items-center gap-3 ${
                    item.type === 'ingreso'
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}
                >
                  {item.type === 'ingreso' ? (
                    <ArrowUpRight size={16} />
                  ) : (
                    <ArrowDownRight size={16} />
                  )}
                  <div>
                    <p className="font-medium capitalize">
                      {item.type} - {item.date}
                    </p>
                    <p className="text-white/70 text-xs">
                      {item.description}
                    </p>
                  </div>
                </div>
                <span
                  className={`font-semibold ${
                    item.type === 'ingreso'
                      ? 'text-green-300'
                      : 'text-red-300'
                  }`}
                >
                  {item.amount < 0 ? '-' : '+'}${Math.abs(item.amount).toLocaleString('es-CO')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};