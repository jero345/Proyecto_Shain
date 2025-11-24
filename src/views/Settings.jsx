// ============================================
// Settings.jsx
// ============================================
import { useEffect, useState } from 'react';
import logoFallback from '@assets/logo.png';
import { getBusinessById, saveBusinessFD } from '@services/businessService';
import { useAuth } from '@context/AuthContext';

export const Settings = () => {
  const { user, updateUser } = useAuth() || { user: null, updateUser: () => {} };
  const userRole = user?.role || '';
  // ✅ Corregido: el ID está en user.business, no en user.businessId
  const businessId = user?.business || user?.businessId || '';

  console.log('👤 Usuario:', user);
  console.log('🏢 Business ID:', businessId);
  console.log('👔 Role:', userRole);

  const [business, setBusiness] = useState({
    id: '',
    name: '',
    goal: '',
    type: '',
    description: '',
    image: '',
    code: '',
  });

  const [logoPreview, setLogoPreview] = useState('');
  const [pendingLogo, setPendingLogo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  // Cargar desde localStorage
  useEffect(() => {
    const cached = localStorage.getItem('business');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        console.log('💾 Cache:', parsed);
        setBusiness(parsed);
        setLogoPreview(parsed.image || '');
      } catch (err) {
        console.error('Error cache:', err);
      }
    }
  }, []);

  // Fetch business
  useEffect(() => {
    if (!businessId) {
      console.error('❌ No hay businessId');
      setLoading(false);
      setError('No se encontró el ID del negocio. Contacta a soporte.');
      return;
    }

    let ignore = false;
    
    const fetchBusiness = async () => {
      try {
        setLoading(true);
        setError('');
        
        const data = await getBusinessById(businessId);
        
        if (ignore) return;
        
        console.log('✅ Business:', data);
        console.log('🔑 Code:', data.code);
        
        setBusiness(data);
        setLogoPreview(data.image || '');
        localStorage.setItem('business', JSON.stringify(data));
        
        if (data?.image && data.image !== user?.logoUrl) {
          updateUser?.({ logoUrl: data.image, logoUpdatedAt: Date.now() });
        }
      } catch (err) {
        if (!ignore) {
          console.error('❌ Error:', err);
          console.error('❌ Status:', err.response?.status);
          console.error('❌ Data:', err.response?.data);
          
          let msg = 'No se pudo cargar el negocio.';
          if (err.response?.status === 404) msg = 'Negocio no encontrado.';
          if (err.response?.status === 401) msg = 'No autorizado. Inicia sesión.';
          
          setError(msg);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchBusiness();
    return () => { ignore = true; };
  }, [businessId]); 

  // Auto-hide toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'goal') {
      const digits = value.replace(/[^\d]/g, ''); 
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

  const handleCopyCode = () => {
    if (!business.code) return;
    navigator.clipboard.writeText(business.code);
    setToast({ type: 'success', message: 'Código copiado ✅' });
  };

  const handleSaveAll = async () => {
    if (!business.id) {
      setToast({ type: 'error', message: 'ID no encontrado.' });
      return;
    }
    
    const snapshot = { ...business };
    
    try {
      setSaving(true);
      
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
      setToast({ type: 'success', message: 'Guardado ✅' });
      
      if (merged?.image && merged.image !== user?.logoUrl) {
        updateUser?.({ logoUrl: merged.image, logoUpdatedAt: Date.now() });
      }
    } catch (err) {
      console.error('❌ Error guardando:', err);
      setBusiness(snapshot);
      setLogoPreview(snapshot.image || '');
      setToast({ type: 'error', message: 'Error al guardar.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-10 text-white">
        <div className="flex items-center gap-3">
          <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></div>
          <span>Cargando información del negocio…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-10">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
          <h2 className="text-red-400 font-semibold text-lg mb-2">Error</h2>
          <p className="text-red-300">{error}</p>
          {!businessId && (
            <div className="mt-4 text-sm text-red-200/70">
              <p>Debug info:</p>
              <pre className="bg-black/30 p-3 rounded text-xs overflow-auto mt-2">
                {JSON.stringify({ 
                  hasUser: !!user, 
                  businessId, 
                  userRole,
                  userKeys: user ? Object.keys(user) : []
                }, null, 2)}
              </pre>
            </div>
          )}
        </div>
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
        {/* Logo */}
        <div className="flex flex-col gap-4">
          <img
            src={logoPreview || business.image || logoFallback}
            alt="Logo"
            className="w-44 h-44 object-contain bg-white rounded-md p-4"
          />
          <label className="text-sm underline text-white/80 hover:text-white cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={handlePickLogo} />
            Seleccionar logo
          </label>
          {pendingLogo && <p className="text-xs text-white/60">Logo listo para guardar.</p>}
        </div>

        {/* Form */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Código del negocio */}
          {userRole === 'propietario_negocio' && business.code && (
            <div className="bg-[#0b0f19] border border-white/20 rounded-lg p-4">
              <label className="block text-sm mb-2 font-medium text-white/90">
                🔑 Código del negocio
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={business.code}
                  readOnly
                  className="flex-1 px-4 py-2 rounded-md bg-black/40 border border-white/10 text-white font-mono text-lg tracking-wider select-all"
                />
                <button
                  onClick={handleCopyCode}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-sm"
                >
                  Copiar
                </button>
              </div>
              <p className="text-xs text-white/50 mt-2">
                Comparte este código para que otros se unan
              </p>
            </div>
          )}

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
          </div>

          <div>
            <label className="block text-sm mb-1">¿Por qué esta meta importa?</label>
            <textarea
              name="description"
              value={business.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 rounded-md bg-[#0b0f19] border border-white/10 text-white resize-none"
              placeholder="Describe tu meta..."
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