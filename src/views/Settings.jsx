// src/views/Settings.jsx
import { useEffect, useState } from 'react';
import logoFallback from '@assets/logo.png';
import { getBusinessByUser, saveBusinessFD } from '@services/businessService';
import { useAuth } from '@context/AuthContext';

export const Settings = () => {
  const { user, updateUser } = useAuth() || { user: null, updateUser: () => {} };
  const userId = user?.id || user?._id || user?.userId || '';

  const [business, setBusiness] = useState({
    id: '',
    name: '',
    goal: '',
    type: '',
    description: '',
    image: '',
  });

  const [logoPreview, setLogoPreview] = useState('');
  const [pendingLogo, setPendingLogo] = useState(null); // File
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  // 1) Cargar desde cache para pintar rápido
  useEffect(() => {
    const cached = localStorage.getItem('business');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setBusiness(parsed);
        setLogoPreview(parsed.image || '');
      } catch {}
    }
  }, []);

  // 2) Fetch real — CORREGIDO (sin bucle)
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setError('No se encontró el usuario.');
      return;
    }

    let ignore = false; // evita setState si el componente se desmonta

    const fetchBusiness = async () => {
      try {
        setLoading(true);
        const data = await getBusinessByUser(userId);
        if (ignore) return;

        setBusiness(data);
        setLogoPreview(data.image || '');
        localStorage.setItem('business', JSON.stringify(data));

        // ✅ solo sincroniza al contexto si CAMBIÓ el logo
        const currentLogo = user?.logoUrl || '';
        if (data?.image && data.image !== currentLogo) {
          updateUser?.({ logoUrl: data.image, logoUpdatedAt: Date.now() });
        }
      } catch (err) {
        if (!ignore) {
          console.error(err);
          setError('No se pudo cargar la información del negocio.');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchBusiness();
    return () => {
      ignore = true;
    };

    // ⚠️ Importante: dependemos SOLO de userId para evitar re-render loops.
  }, [userId]); // <-- NO pongas updateUser aquí

  // 3) Autocierre del toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'goal') {
      const digits = value.replace(/[^\d]/g, ''); // solo números visibles
      setBusiness((prev) => ({ ...prev, goal: digits }));
      return;
    }
    setBusiness((prev) => ({ ...prev, [name]: value }));
  };

  const handlePickLogo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingLogo(file);
    const url = URL.createObjectURL(file);
    setLogoPreview(url);
  };

  const handleSaveAll = async () => {
    if (!business.id) {
      return setToast({ type: 'error', message: 'ID de negocio no encontrado.' });
    }

    const snapshot = { ...business };
    try {
      setSaving(true);
      // Guardamos TODO como FormData (strings + image opcional)
      const updated = await saveBusinessFD(business.id, {
        name: business.name,
        goal: business.goal,
        type: business.type,
        description: business.description,
        imageFile: pendingLogo || null,
      });

      const merged = { ...snapshot, ...updated };
      setBusiness(merged);
      setPendingLogo(null);
      localStorage.setItem('business', JSON.stringify(merged));
      setToast({ type: 'success', message: 'Cambios guardados ✅' });

      // ✅ refresca el avatar de Navbar inmediatamente SOLO si cambió
      const currentLogo = user?.logoUrl || '';
      if (merged?.image && merged.image !== currentLogo) {
        updateUser?.({ logoUrl: merged.image, logoUpdatedAt: Date.now() });
      }
    } catch (err) {
      console.error(err);
      setBusiness(snapshot);
      setLogoPreview(snapshot.image || '');
      setToast({ type: 'error', message: 'No se pudieron guardar los cambios.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-10 text-white">
        Cargando información del negocio…
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-10 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-10 text-white space-y-8">
      <div className="flex items-center gap-2 text-sm font-semibold text-white/70">
        ⚙️ <span>Configuración</span>
      </div>
      <h1 className="text-3xl md:text-4xl font-extrabold">Información del negocio</h1>
      <div className="flex flex-col md:flex-row md:items-start gap-10">
        {/* Logo + uploader */}
        <div className="flex flex-col gap-4">
          <img
            src={logoPreview || business.image || logoFallback}
            alt="Logo del negocio"
            className="w-44 h-44 object-contain bg-white rounded-md p-4"
          />
          <label className="text-sm underline text-white/80 hover:text-white cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={handlePickLogo} />
            Seleccionar logo
          </label>
          {pendingLogo && (
            <p className="text-xs text-white/60">Logo listo para guardar.</p>
          )}
        </div>

        {/* Form */}
        <div className="flex-1 flex flex-col gap-4">
          <div>
            <label className="block text-sm mb-1">Nombre del negocio*</label>
            <input
              type="text"
              name="name"
              value={business.name}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md bg-[#0b0f19] border border-white/10 text-white"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Tipo de negocio*</label>
            <input
              type="text"
              name="type"
              value={business.type}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md bg-[#0b0f19] border border-white/10 text-white"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Meta mensual*</label>
            <input
              type="text"
              inputMode="numeric"
              name="goal"
              value={business.goal}
              onChange={handleChange}
              placeholder="Ej. 5000"
              className="w-full px-4 py-2 rounded-md bg-[#0b0f19] border border-white/10 text-white"
            />
            <p className="text-xs text-white/50 mt-1">
              El backend la espera como string.
            </p>
          </div>

          <div>
            <label className="block text-sm mb-1">Descripción</label>
            <textarea
              name="description"
              value={business.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 rounded-md bg-[#0b0f19] border border-white/10 text-white"
              placeholder="Describe tu negocio…"
            />
          </div>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="bg-[#ff5a00] hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-full mt-4 w-max"
          >
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </div>

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

export default Settings;
