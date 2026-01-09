// src/admin/AdminPanel.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import {
  getAllUsersService,
  updateUserStatusService,
  updateUserService,
} from "@services/adminPanelService";

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // ID del usuario que se está actualizando

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "" });
  const [saving, setSaving] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsersService(page, 10);
      
      // Manejar diferentes estructuras de respuesta
      let usersData = [];
      let totalPagesData = 1;
      
      if (Array.isArray(response)) {
        usersData = response;
      } else if (response?.data) {
        usersData = Array.isArray(response.data) ? response.data : [];
        totalPagesData = response.totalPages || response.total_pages || 1;
      } else if (response?.users) {
        usersData = response.users;
        totalPagesData = response.totalPages || 1;
      }
      
      console.log('[AdminPanel] Usuarios cargados:', usersData.length);
      setUsers(usersData);
      setTotalPages(totalPagesData);
    } catch (err) {
      console.error("[AdminPanel] Error al traer usuarios:", err);
      alert("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  // Función para normalizar el estado (backend puede enviar diferentes formatos)
  const normalizeStatus = (status) => {
    if (!status) return 'inactive';
    const s = String(status).toLowerCase();
    if (s === 'active' || s === 'activo' || s === 'true' || s === '1') return 'active';
    return 'inactive';
  };

  // Función para mostrar el estado en español
  const getStatusLabel = (status) => {
    return normalizeStatus(status) === 'active' ? 'Activo' : 'Inactivo';
  };

  // Función para obtener el nuevo estado (toggle)
  const getNewStatus = (currentStatus) => {
    return normalizeStatus(currentStatus) === 'active' ? 'inactive' : 'active';
  };

  const handleStatusChange = async (user) => {
    const userId = user.id || user._id;
    const currentStatus = normalizeStatus(user.status);
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      setUpdating(userId);
      console.log(`[AdminPanel] Cambiando estado de ${userId}: ${currentStatus} -> ${newStatus}`);
      
      await updateUserStatusService(userId, newStatus);
      
      // Actualizar el estado local
      setUsers((prev) =>
        prev.map((u) => {
          const id = u.id || u._id;
          return id === userId ? { ...u, status: newStatus } : u;
        })
      );
      
      console.log('[AdminPanel] ✅ Estado actualizado correctamente');
    } catch (err) {
      console.error("[AdminPanel] Error al actualizar estado:", err);
      alert("Error al actualizar estado del usuario");
    } finally {
      setUpdating(null);
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name || user.fullName || user.firstName || "",
      email: user.email || "",
      role: user.role || "user",
    });
    setIsModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedUser) return;
    
    const userId = selectedUser.id || selectedUser._id;
    
    try {
      setSaving(true);
      console.log('[AdminPanel] Actualizando usuario:', userId, editForm);
      
      await updateUserService(userId, editForm);
      
      // Actualizar el estado local
      setUsers((prev) =>
        prev.map((u) => {
          const id = u.id || u._id;
          return id === userId ? { ...u, ...editForm } : u;
        })
      );
      
      setIsModalOpen(false);
      console.log('[AdminPanel] ✅ Usuario actualizado correctamente');
    } catch (err) {
      console.error("[AdminPanel] Error actualizando usuario:", err);
      alert("Error al actualizar usuario: " + (err?.response?.data?.message || err.message || "Error desconocido"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white px-4 sm:px-6 py-8">

      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Panel de Administración</h1>
          <p className="text-gray-400 mt-1">Gestión completa de usuarios del sistema</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate("/admin/referrals")}
            className="px-4 sm:px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition-all shadow-md"
          >
            Ver Referidos
          </button>
          <button
            onClick={() => navigate("/admin/timeslots")}
            className="px-4 sm:px-5 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-semibold transition-all shadow-md"
          >
            Crear Horarios
          </button>
          <button
            onClick={logout}
            className="px-4 sm:px-5 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold transition-all shadow-md"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto">

        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg">Cargando usuarios...</p>
          </div>
        ) : (
          <>
            {/* Tabla */}
            <div className="overflow-x-auto rounded-xl border border-gray-800 shadow-xl bg-gray-900/40 backdrop-blur-md">
              <table className="min-w-full text-sm text-gray-300">
                <thead className="bg-gray-800/70 border-b border-gray-700">
                  <tr>
                    <th className="px-4 sm:px-6 py-4 text-left font-semibold">Nombre</th>
                    <th className="px-4 sm:px-6 py-4 text-left font-semibold">Usuario</th>
                    <th className="px-4 sm:px-6 py-4 text-left font-semibold hidden md:table-cell">Correo</th>
                    <th className="px-4 sm:px-6 py-4 text-left font-semibold">Rol</th>
                    <th className="px-4 sm:px-6 py-4 text-left font-semibold">Estado</th>
                    <th className="px-4 sm:px-6 py-4 text-center font-semibold">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {users.length > 0 ? (
                    users.map((u) => {
                      const userId = u.id || u._id;
                      const isActive = normalizeStatus(u.status) === 'active';
                      const isUpdating = updating === userId;
                      
                      return (
                        <tr key={userId} className="border-b border-gray-800 hover:bg-gray-800/40 transition-all">
                          <td className="px-4 sm:px-6 py-4">
                            {u.name || u.fullName || u.firstName || '-'}
                          </td>
                          <td className="px-4 sm:px-6 py-4">{u.username || '-'}</td>
                          <td className="px-4 sm:px-6 py-4 hidden md:table-cell">{u.email || '-'}</td>
                          <td className="px-4 sm:px-6 py-4 capitalize">{u.role || '-'}</td>

                          <td className="px-4 sm:px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                isActive
                                  ? "bg-green-600/30 text-green-300 border border-green-600/50"
                                  : "bg-red-600/30 text-red-300 border border-red-600/50"
                              }`}
                            >
                              {getStatusLabel(u.status)}
                            </span>
                          </td>

                          <td className="px-4 sm:px-6 py-4">
                            <div className="flex justify-center gap-2">
                              {/* Botón Activar/Desactivar */}
                              <button
                                onClick={() => handleStatusChange(u)}
                                disabled={isUpdating}
                                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 ${
                                  isActive
                                    ? "bg-orange-600 hover:bg-orange-700 text-white"
                                    : "bg-green-600 hover:bg-green-700 text-white"
                                }`}
                              >
                                {isUpdating ? (
                                  <>
                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>...</span>
                                  </>
                                ) : (
                                  <span>{isActive ? "Desactivar" : "Activar"}</span>
                                )}
                              </button>

                              {/* Botón Editar */}
                              <button
                                onClick={() => handleEditClick(u)}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-md text-xs font-semibold transition-all shadow"
                              >
                                Editar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                        No hay usuarios registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center items-center gap-4">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-800/70 rounded-lg disabled:opacity-40 hover:bg-gray-700 transition"
                >
                  Anterior
                </button>

                <span className="text-gray-300">
                  Página <strong>{page}</strong> de <strong>{totalPages}</strong>
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-gray-800/70 rounded-lg disabled:opacity-40 hover:bg-gray-700 transition"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Edición */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Editar Usuario</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nombre</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                  placeholder="Nombre completo"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Correo</label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                  placeholder="correo@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Rol</label>
                <select
                  name="role"
                  value={editForm.role}
                  onChange={(e) =>
                    setEditForm({ ...editForm, role: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                >
                  <option value="user">Usuario</option>
                  <option value="prestador_servicios">Prestador de Servicios</option>
                  <option value="propietario_negocio">Propietario de Negocio</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-6 gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={saving}
                className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                onClick={handleEditSubmit}
                disabled={saving}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <span>Guardar</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;