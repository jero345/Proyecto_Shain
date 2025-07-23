import { useState, useEffect } from 'react';
import { Pencil, Save, X } from 'lucide-react';
import { getUserByIdService, updateUserService } from '@services/authService';

export const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '' });

  const userId = JSON.parse(localStorage.getItem('user'))?.id;

  useEffect(() => {
    if (userId) {
      getUserByIdService(userId).then((data) => {
        setUser(data);
        setEditForm({ name: data.name, email: data.email });
      });
    }
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const updated = await updateUserService(userId, {
        name: editForm.name,
        email: editForm.email,
      });
      setUser(updated);
      setIsEditing(false);
    } catch (err) {
      console.error('Error actualizando usuario', err);
    }
  };

  if (!user) return <p className="text-white p-6">Cargando perfil...</p>;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-10 text-white">
      <h1 className="text-3xl font-bold mb-2">Mi Perfil</h1>
      <p className="text-white/70 mb-8 max-w-xl">
        Revisa y edita tus datos personales para mantener tu información siempre actualizada.
      </p>

      <div className="bg-gradient-to-br from-gradientStart via-gradientMid2 to-gradientEnd p-8 rounded-xl border border-white/10 backdrop-blur-md space-y-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{user.name}</h2>
            <p className="text-white/60">{user.role}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm mb-1">Nombre completo</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={editForm.name}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md bg-white/10 text-white"
              />
            ) : (
              <p className="bg-white/10 px-4 py-2 rounded-md">{user.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">Correo electrónico</label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md bg-white/10 text-white"
              />
            ) : (
              <p className="bg-white/10 px-4 py-2 rounded-md">{user.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">Rol</label>
            <p className="bg-white/10 px-4 py-2 rounded-md">{user.role}</p>
          </div>

          <div>
            <label className="block text-sm mb-1">Fecha de registro</label>
            <p className="bg-white/10 px-4 py-2 rounded-md">
              {new Date(user.createdAt).toLocaleDateString('es-CO')}
            </p>
          </div>
        </div>

        {isEditing ? (
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 transition"
            >
              <Save size={16} /> Guardar cambios
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 transition"
            >
              <X size={16} /> Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setEditForm({ name: user.name, email: user.email });
              setIsEditing(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 transition"
          >
            <Pencil size={16} /> Editar perfil
          </button>
        )}
      </div>
    </div>
  );
};
