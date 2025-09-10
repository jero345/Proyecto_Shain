// src/admin/AdminPanel.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@auth/useAuth";

// Services (tu archivo real ya normaliza { data, totalPages })
import {
  getAllUsersService,
  updateUserStatusService,
  updateUserService,
} from "@services/adminPanelService";

function AdminPanel() {
  // -------------------------
  // State
  // -------------------------
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Paginación
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal edición
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "" });

  const { logout } = useAuth();
  const navigate = useNavigate();

  // -------------------------
  // Effects
  // -------------------------
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // -------------------------
  // Data fetching
  // -------------------------
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, totalPages: tp } = await getAllUsersService(page, 10);
      setUsers(data || []);
      setTotalPages(tp || 1);
    } catch (err) {
      console.error("❌ Error al traer usuarios:", err);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Handlers
  // -------------------------
  const handleStatusChange = async (id, status) => {
    try {
      await updateUserStatusService(id, status);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));
      alert("✅ Estado actualizado correctamente");
    } catch {
      alert("❌ Error al actualizar estado");
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "",
    });
    setIsModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async () => {
    try {
      await updateUserService(selectedUser.id, editForm);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, ...editForm } : u
        )
      );
      setIsModalOpen(false);
      alert("✅ Usuario actualizado");
    } catch {
      alert("❌ Error al actualizar usuario");
    }
  };

  // -------------------------
  // Render
  // -------------------------
  return (
    <div className="p-6 min-h-screen bg-gray-900 text-white">
      {/* Header + Acciones */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate("/admin/referrals")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm"
          >
            Ver Referidos
          </button>

          <button
            onClick={() => navigate("/admin/timeslots")}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-md text-sm"
          >
            Crear horarios
          </button>

          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Tabla de usuarios */}
      {loading ? (
        <p className="text-center">Cargando usuarios...</p>
      ) : (
        <>
          <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-lg">
            <table className="min-w-full text-left text-sm text-gray-300">
              <thead className="bg-gray-700 text-gray-200">
                <tr>
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3">Usuario</th>
                  <th className="px-6 py-3">Correo</th>
                  <th className="px-6 py-3">Rol</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((u) => (
                    <tr key={u.id} className="border-t border-gray-700">
                      <td className="px-6 py-3">{u.name}</td>
                      <td className="px-6 py-3">{u.username}</td>
                      <td className="px-6 py-3">{u.email}</td>
                      <td className="px-6 py-3">{u.role}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            u.status === "active" ? "bg-green-600" : "bg-red-600"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 flex gap-2">
                        <button
                          onClick={() =>
                            handleStatusChange(
                              u.id,
                              u.status === "active" ? "inactive" : "active"
                            )
                          }
                          className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded-md"
                        >
                          {u.status === "active" ? "Desactivar" : "Activar"}
                        </button>

                        <button
                          onClick={() => handleEditClick(u)}
                          className="px-3 py-1 text-sm bg-yellow-600 hover:bg-yellow-700 rounded-md"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-4 text-center text-gray-400"
                    >
                      No hay usuarios registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex justify-center mt-4 gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-700 rounded-md disabled:opacity-50"
            >
              Anterior
            </button>

            <span className="px-3 py-1">
              Página {page} de {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3 py-1 bg-gray-700 rounded-md disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </>
      )}

      {/* Modal de edición */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Editar Usuario</h2>

            <div className="space-y-4">
              <input
                type="text"
                name="name"
                value={editForm.name}
                onChange={handleEditChange}
                className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"
                placeholder="Nombre"
              />

              <input
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleEditChange}
                className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"
                placeholder="Correo"
              />

              <select
                name="role"
                value={editForm.role}
                onChange={handleEditChange}
                className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"
              >
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div className="flex justify-end mt-6 gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-600 rounded-md"
              >
                Cancelar
              </button>

              <button
                onClick={handleEditSubmit}
                className="px-4 py-2 bg-green-600 rounded-md"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
