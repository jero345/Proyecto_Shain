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
    goal: '',
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const navigate = useNavigate();
  
  // ✅ Función para obtener userId de múltiples fuentes posibles en localStorage
  const getUserId = () => {
    try {
      // Opción 1: Buscar en 'user_id' directamente
      const directUserId = localStorage.getItem('user_id');
      if (directUserId) {
        console.log('userId encontrado en user_id:', directUserId);
        return directUserId;
      }

      // Opción 2: Buscar en 'auth:user' (formato auth)
      const authUser = localStorage.getItem('auth:user');
      if (authUser) {
        const parsed = JSON.parse(authUser);
        if (parsed?.id || parsed?._id) {
          console.log('userId encontrado en auth:user:', parsed?.id || parsed?._id);
          return parsed?.id || parsed?._id;
        }
      }

      // Opción 3: Buscar en 'authuser' (sin dos puntos)
      const authUserAlt = localStorage.getItem('authuser');
      if (authUserAlt) {
        const parsed = JSON.parse(authUserAlt);
        if (parsed?.id || parsed?._id) {
          console.log('userId encontrado en authuser:', parsed?.id || parsed?._id);
          return parsed?.id || parsed?._id;
        }
      }

      // Opción 4: Buscar en 'user'
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsed = JSON.parse(userData);
        if (parsed?.id || parsed?._id) {
          console.log('userId encontrado en user:', parsed?.id || parsed?._id);
          return parsed?.id || parsed?._id;
        }
      }

      console.error('No se encontró userId en ninguna ubicación del localStorage');
      return null;
    } catch (error) {
      console.error('Error obteniendo userId:', error);
      return null;
    }
  };

  const userId = getUserId();

  // ✅ Formatear número con separadores de miles (puntos para Colombia)
  const formatNumber = (value) => {
    if (!value && value !== 0) return '';
    return Number(value).toLocaleString('es-CO');
  };

  // ✅ Remover formato y obtener solo números
  const unformatNumber = (value) => {
    if (!value) return '';
    // Remover todo excepto números
    return value.replace(/\D/g, '');
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        console.error('No se encontró userId');
        setMessage({ text: 'No se pudo identificar al usuario. Por favor inicia sesión nuevamente.', type: 'error' });
        setInitialLoading(false);
        return;
      }

      try {
        setInitialLoading(true);
        console.log('Fetching profile for userId:', userId);
        const data = await getUserByIdService(userId);
        console.log('Profile data received:', data);
        
        if (data && data.name) {
          setUser(data);
          setEditForm({
            name: data.name || '',
            lastName: data.lastName || '',
            username: data.username || '',
            email: data.email || '',
            goal: data.goal || '',
          });
        } else {
          console.error('Datos de usuario vacíos o inválidos:', data);
          setMessage({ text: 'No se encontraron datos del usuario', type: 'error' });
        }
      } catch (error) {
        console.error('Error al cargar perfil:', error);
        setMessage({ text: 'Error al cargar el perfil. Intenta de nuevo.', type: 'error' });
      } finally {
        setInitialLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // ✅ Manejo especial para el campo goal
    if (name === 'goal') {
      const numericValue = unformatNumber(value);
      setEditForm((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setEditForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    const { name, lastName, username, email, goal } = editForm;

    if (!name || !lastName || !username || !email) {
      setMessage({ text: 'Por favor completa todos los campos requeridos.', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      
      const updated = await updateUserService({
        name,
        lastName,
        username,
        email,
        goal: goal || 0,
      });

      setUser(updated);
      setIsEditing(false);
      setMessage({ text: 'Perfil actualizado con éxito ✅', type: 'success' });
      
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

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="animate-spin h-10 w-10 border-4 border-t-transparent border-purple-400 rounded-full"></div>
        <p className="ml-3">Cargando perfil...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white gap-4">
        <div className="text-yellow-400 text-6xl">⚠️</div>
        <h2 className="text-xl font-semibold">No se pudo cargar el perfil</h2>
        <p className="text-white/60 text-center max-w-md">
          {message.text || 'Hubo un problema al obtener la información del usuario.'}
        </p>
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md transition"
          >
            Reintentar
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md transition"
          >
            Ir a Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-10 text-white">
      <h1 className="text-3xl font-bold mb-2">Mi Perfil</h1>

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
            {user.name?.charAt(0) || '?'}
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
                field === 'goal' ? (
                  // ✅ Input especial para meta con formato de miles
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60">$</span>
                    <input
                      type="text"
                      name={field}
                      inputMode="numeric"
                      value={editForm[field] ? formatNumber(editForm[field]) : ''}
                      onChange={handleChange}
                      placeholder="Ej: 5.000.000"
                      className="w-full pl-8 pr-4 py-2 rounded-md bg-white/10 text-white border border-white/20 focus:border-purple-500 focus:outline-none transition"
                    />
                  </div>
                ) : (
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    name={field}
                    value={editForm[field]}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md bg-white/10 text-white border border-white/20 focus:border-purple-500 focus:outline-none transition"
                  />
                )
              ) : (
                <p className="bg-white/10 px-4 py-2 rounded-md">
                  {field === 'goal' 
                    ? (user[field] ? `$${formatNumber(user[field])}` : 'Sin meta definida')
                    : user[field] || '-'
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
                  goal: user.goal || '',
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