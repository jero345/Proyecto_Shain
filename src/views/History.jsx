import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Plus, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export const History = () => {
  const [movements, setMovements] = useState([]);
  const [filterType, setFilterType] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('movements')) || [];
    setMovements(saved);
  }, []);

  const filteredMovements = movements.filter((item) => {
    const matchesType = filterType === 'todos' || item.type === filterType;
    const matchesSearch = item.description
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-10 text-white">
      {/* Encabezado con ícono igual a tu imagen */}
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-4 h-4 text-white/60" />
        <h1 className="text-base font-semibold text-white/80">Historial</h1>
      </div>

      {/* Título y botón */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Movimientos recientes</h2>
        <Link to="/dashboard/agregar-movimiento">
          <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-full text-sm font-medium transition">
            <Plus size={16} /> Agregar Movimiento
          </button>
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterType('todos')}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
            filterType === 'todos'
              ? 'bg-orange-500 text-white'
              : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          Ver Todos
        </button>
        <button
          onClick={() => setFilterType('ingreso')}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
            filterType === 'ingreso'
              ? 'bg-white/10 border border-green-500 text-green-300'
              : 'bg-white/5 hover:bg-white/10 text-green-400'
          }`}
        >
          Ver Ingresos
        </button>
        <button
          onClick={() => setFilterType('egreso')}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
            filterType === 'egreso'
              ? 'bg-white/10 border border-red-500 text-red-300'
              : 'bg-white/5 hover:bg-white/10 text-red-400'
          }`}
        >
          Ver Egresos
        </button>
      </div>

      {/* Lista */}
      <div className="bg-[#0b0f19] rounded-xl p-6">
        <h3 className="text-base font-bold mb-4">
          Todos los movimientos recientes
        </h3>
        {filteredMovements.length === 0 ? (
          <p className="text-sm text-white/60">No se encontraron movimientos.</p>
        ) : (
          <ul className="space-y-4">
            {filteredMovements.map((item, idx) => (
              <li
                key={idx}
                className="flex justify-between items-center bg-[#0f172a] border border-white/5 rounded-2xl px-4 py-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.type === 'ingreso' ? 'bg-green-600' : 'bg-red-600'
                    }`}
                  >
                    {item.type === 'ingreso' ? (
                      <ArrowUpRight size={16} />
                    ) : (
                      <ArrowDownRight size={16} />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold capitalize">
                      {item.type}
                    </p>
                    <p className="text-xs text-white/50">
                      {item.date}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">
                    ${Number(item.amount).toLocaleString('es-CO')}
                  </p>
                  <p className="text-xs text-white/50">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
