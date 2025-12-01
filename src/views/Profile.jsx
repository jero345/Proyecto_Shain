import { useState, useEffect } from 'react';
import { Pencil, Save, X, Lock } from 'lucide-react';
import { getUserByIdService, updateUserService } from '@services/authService';
import { useNavigate } from 'react-router-dom';

export const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    lastName: '',
    username: '',
    email: '',
    goal: '', // Meta personal agregada
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const userId = JSON.parse(localStorage.getItem('user'))?.id;

  useEffect(() => {
    if (userId) {
      getUserByIdService(userId).then((data) => {
        setUser(data);
        setEditForm({
          name: data.name || '',
          lastName: data.lastName || '',
          username: data.username || '',
          email: data.email || '',
          goal: data.goal || '', // Asignación de meta personal
        });
      }).catch((error) => {
        console.error('Error al cargar perfil:', error);
        setMessage({ text: 'Error al cargar el perfil', type: 'error' });
      });
    }
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const { name, lastName, username, email, goal } = editForm;

    // Validación para asegurarse que todos los campos estén completos
    if (!name || !lastName || !username || !email) {
      setMessage({ text: 'Por favor completa todos los campos requeridos.', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      
      // ✅ Ahora solo enviamos el payload, sin el ID
      const updated = await updateUserService({
        name,
        lastName,
        username,
        email,
        goal: goal || 0, // Enviando meta personal (0 si está vacío)
      });

      setUser(updated);
      setIsEditing(false);
      setMessage({ text: 'Perfil actualizado con éxito ✅', type: 'success' });
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 3000);
    } catch (err) {
      console.error('Error actualizando usuario', err);
      setMessage({ 
        text: err?.message || 'Error al actualizar el perfil. Intenta de nuevo.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <div className="animate-spin h-10 w-10 border-4 border-t-transparent border-purple-400 rounded-full"></div>
      <p className="ml-3">Cargando perfil...</p>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-10 text-white">
      <h1 className="text-3xl font-bold mb-2">Mi Perfil</h1>

      {/* ✅ Mensaje de alerta */}
      {message.text && (
        <div
          className={`mb-4 p-4 rounded-md text-sm font-medium ${
            message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-gradient-to-br from-gradientStart via-gradientMid2 to-gradientEnd p-8 rounded-xl border border-white/10 backdrop-blur-md space-y-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{user.name} {user.lastName}</h2>
            <p className="text-white/60">@{user.username}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {['name', 'lastName', 'username', 'email', 'goal'].map((field) => (
            <div key={field}>
              <label className="block text-sm mb-1 text-white/80">
                {field === 'name' ? 'Nombre' :
                 field === 'lastName' ? 'Apellido' :
                 field === 'username' ? 'Usuario' :
                 field === 'email' ? 'Correo electrónico' :
                 'Meta personal'}
                {field !== 'goal' && <span className="text-red-400 ml-1">*</span>}
              </label>
              {isEditing ? (
                <input
                  type={field === 'email' ? 'email' : field === 'goal' ? 'number' : 'text'}
                  name={field}
                  value={editForm[field]}
                  onChange={handleChange}
                  placeholder={field === 'goal' ? 'Ej: 5000000' : ''}
                  className="w-full px-4 py-2 rounded-md bg-white/10 text-white border border-white/20 focus:border-purple-500 focus:outline-none transition"
                />
              ) : (
                <p className="bg-white/10 px-4 py-2 rounded-md">
                  {field === 'goal' 
                    ? (user[field] ? `$${Number(user[field]).toLocaleString('es-CO')}` : 'Sin meta definida')
                    : user[field]
                  }
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={16} /> Guardar cambios
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setMessage({ text: '', type: '' });
                  setEditForm({
                    name: user.name,
                    lastName: user.lastName,
                    username: user.username,
                    email: user.email,
                    goal: user.goal || '',
                  });
                }}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={16} /> Cancelar
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setEditForm({
                  name: user.name,
                  lastName: user.lastName,
                  username: user.username,
                  email: user.email,
                  goal: user.goal || '', // Asegúrate de establecer la meta personal
                });
                setIsEditing(true);
                setMessage({ text: '', type: '' });
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 transition"
            >
              <Pencil size={16} /> Editar perfil
            </button>
          )}

          <button
            onClick={() => navigate('/dashboard/change-password')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-yellow-600 hover:bg-yellow-700 transition"
          >
            <Lock size={16} /> Cambiar contraseña
          </button>
        </div>
      </div>
    </div>
  );
};