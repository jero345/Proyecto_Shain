import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  Pencil,
  Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  getMovementsService,
  deleteMovementService,
  updateMovementService
} from '@services/addmovementService';
import { Dialog } from '@headlessui/react';

const getSafeId = (obj) => obj?.id ?? obj?._id;

export const History = () => {
  const [movements, setMovements] = useState([]);
  const [filterType, setFilterType] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [editForm, setEditForm] = useState({ value: '', description: '' });

  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const data = await getMovementsService(filterType);
        setMovements(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching movements', err);
        setToast({ type: 'error', message: 'No se pudieron cargar los movimientos.' });
      }
    };
    fetchMovements();
  }, [filterType]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const filteredMovements = movements.filter((item) =>
    (item.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (item) => {
    setSelectedMovement(item);
    setEditForm({ value: String(item.value ?? ''), description: item.description || '' });
    setEditModalOpen(true);
  };

  const handleDeleteClick = (item) => {
    setSelectedMovement(item);
    setDeleteModalOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      const updated = {
        ...selectedMovement,
        value: String(editForm.value),
        description: editForm.description
      };
      await updateMovementService(getSafeId(selectedMovement), updated);
      setMovements((prev) =>
        prev.map((m) => (getSafeId(m) === getSafeId(selectedMovement) ? updated : m))
      );
      setEditModalOpen(false);
      setToast({ message: 'Movimiento actualizado.', type: 'success' });
    } catch (err) {
      console.error('Error al actualizar', err);
      setToast({ message: 'Error al actualizar.', type: 'error' });
    }
  };

  // 🟢 Borrado optimista: cerramos modal y quitamos el ítem ANTES de esperar al backend
  const handleDeleteConfirm = async () => {
    if (!selectedMovement) return;

    const safeId = getSafeId(selectedMovement);

    // Guarda snapshot para poder revertir si falla
    const snapshot = movements;

    // 1) Optimista: quitamos de la lista y cerramos modal YA
    setMovements((prev) => prev.filter((m) => getSafeId(m) !== safeId));
    setDeleteModalOpen(false);
    setSelectedMovement(null);

    // 2) Llamada real
    try {
      await deleteMovementService(safeId);
      setToast({ type: 'success', message: 'Movimiento eliminado.' });
    } catch (err) {
      console.error('Error al eliminar', err);

      // Algunos backends devuelven 404 si ya estaba eliminado; lo tratamos como éxito
      const status = err?.response?.status ?? err?.status;
      if (status === 404) {
        setToast({ type: 'success', message: 'Movimiento eliminado.' });
      } else {
        // Revertir cambios si falló de verdad
        setMovements(snapshot);
        setToast({ type: 'error', message: 'No se pudo eliminar el movimiento.' });
      }
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-10 text-white">
      <div className="flex items-center gap-2 mb-4">
        <h1 className="text-base font-semibold text-white/80">Historial</h1>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Movimientos recientes</h2>
        <Link to="/dashboard/agregar-movimiento">
          <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-full text-sm font-medium transition">
            + Agregar Movimiento
          </button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        {['todos', 'ingreso', 'egreso'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
              filterType === type
                ? type === 'todos'
                  ? 'bg-orange-500 text-white'
                  : type === 'ingreso'
                  ? 'bg-white/10 border border-green-500 text-green-300'
                  : 'bg-white/10 border border-red-500 text-red-300'
                : type === 'ingreso'
                ? 'bg-white/5 hover:bg-white/10 text-green-400'
                : 'bg-white/5 hover:bg-white/10 text-red-400'
            }`}
          >
            Ver {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por descripción…"
          className="ml-auto px-4 py-2 rounded-md bg-white/10 border border-white/20 text-white text-sm"
        />
      </div>

      <div className="bg-[#0b0f19] rounded-xl p-6">
        <h3 className="text-base font-bold mb-4">Todos los movimientos recientes</h3>
        {filteredMovements.length === 0 ? (
          <p className="text-sm text-white/60">No se encontraron movimientos.</p>
        ) : (
          <ul className="space-y-4">
            {filteredMovements.map((item) => {
              const itemId = getSafeId(item);
              return (
                <li
                  key={itemId}
                  className="flex justify-between items-center bg-[#0f172a] border border-white/5 rounded-2xl px-4 py-4"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        item.type === 'ingreso' ? 'bg-green-600' : 'bg-red-600'
                      }`}
                    >
                      {item.type === 'ingreso' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold capitalize">{item.type}</p>
                      <p className="text-xs text-white/50">{item.date}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold">
                      {item.type === 'egreso' ? '-' : '+'}${Number(item.value ?? 0).toLocaleString('es-CO')}
                    </p>
                    <p className="text-xs text-white/50">{item.description || '-'}</p>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => handleEditClick(item)} className="hover:text-yellow-400" title="Editar">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDeleteClick(item)} className="hover:text-red-400" title="Eliminar">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Modal Editar */}
      <Dialog open={editModalOpen} onClose={setEditModalOpen} className="relative z-50">
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-[#1c1c1e] p-6 rounded-xl w-full max-w-md text-white space-y-4 border border-white/10">
            <Dialog.Title className="text-lg font-semibold">Editar Movimiento</Dialog.Title>

            <div>
              <label className="block text-sm font-medium">Valor</label>
              <input
                type="text"
                value={editForm.value}
                onChange={(e) => setEditForm({ ...editForm, value: e.target.value })}
                className="w-full px-4 py-2 rounded-md bg-white/10 border border-white/20 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Descripción</label>
              <input
                type="text"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full px-4 py-2 rounded-md bg-white/10 border border-white/20 text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditModalOpen(false)} className="text-white/70 hover:underline">
                Cancelar
              </button>
              <button
                onClick={handleEditSubmit}
                className="bg-gradient-to-br from-gradientStart to-gradientEnd px-4 py-2 rounded-md font-semibold"
              >
                Guardar
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Modal Eliminar */}
      <Dialog open={deleteModalOpen} onClose={setDeleteModalOpen} className="relative z-50">
        <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-[#1c1c1e] rounded-xl p-6 w-full max-w-md text-white space-y-4 border border-white/10">
            <Dialog.Title className="text-lg font-semibold">¿Eliminar movimiento?</Dialog.Title>
            <Dialog.Description className="text-sm text-white/60">
              Esta acción no se puede deshacer.
            </Dialog.Description>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="text-white/70 hover:underline"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-1.5 rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-[9999] px-4 py-2 rounded-lg text-white shadow-lg
            ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}
            animate-[fadeIn_150ms_ease-out,fadeOut_300ms_ease-in_2200ms_forwards]`}
        >
          {toast.message}
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeOut { to { opacity: 0; transform: translateY(8px); } }
      `}</style>
    </div>
  );
};

export default History;
