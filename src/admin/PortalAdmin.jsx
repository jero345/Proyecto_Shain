import { useEffect, useState } from 'react';
import { Pencil, Save } from 'lucide-react';

export const PortalAdmin = () => {
  const [users, setUsers] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editedUser, setEditedUser] = useState({});

  useEffect(() => {
    // Simulación de obtener usuarios desde localStorage o backend
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
    setUsers(storedUsers);
  }, []);

  const handleEdit = (index) => {
    setEditIndex(index);
    setEditedUser(users[index]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const updatedUsers = [...users];
    updatedUsers[editIndex] = editedUser;
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setEditIndex(null);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-10 text-white">
      <h1 className="text-2xl font-bold mb-6">Panel de Administración</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-[#1e1e2f] border border-white/10 rounded-md">
          <thead className="text-left text-sm text-white/70 bg-black/30">
            <tr>
              <th className="p-4">Nombre</th>
              <th className="p-4">Usuario</th>
              <th className="p-4">Correo</th>
              <th className="p-4">Rol</th>
              <th className="p-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr key={idx} className="border-t border-white/5">
                <td className="p-4">
                  {editIndex === idx ? (
                    <input
                      name="name"
                      value={editedUser.name}
                      onChange={handleChange}
                      className="bg-white/10 text-white px-2 py-1 rounded w-full"
                    />
                  ) : (
                    user.name
                  )}
                </td>
                <td className="p-4">{user.username}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">
                  {editIndex === idx ? (
                    <select
                      name="role"
                      value={editedUser.role}
                      onChange={handleChange}
                      className="bg-white/10 text-white px-2 py-1 rounded"
                    >
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                    </select>
                  ) : (
                    user.role
                  )}
                </td>
                <td className="p-4">
                  {editIndex === idx ? (
                    <button onClick={handleSave} className="text-green-400 hover:underline">
                      <Save size={16} className="inline mr-1" /> Guardar
                    </button>
                  ) : (
                    <button onClick={() => handleEdit(idx)} className="text-blue-400 hover:underline">
                      <Pencil size={16} className="inline mr-1" /> Editar
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center text-white/50 py-6">
                  No hay usuarios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};