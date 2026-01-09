// ============================================
// Settings.jsx
// ============================================
import { useEffect, useState } from 'react';
import { Building2, Target, FileText, Upload, Copy, Check, Settings as SettingsIcon, AlertCircle } from 'lucide-react';
import logoFallback from '@assets/logo.png';
import { getBusinessById, saveBusinessFD } from '@services/businessService';
import { useAuth } from '@context/AuthContext';

export const Settings = () => {
  const { user, updateUser } = useAuth() || { user: null, updateUser: () => {} };
  const userRole = user?.role || '';
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
  const [copied, setCopied] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Formatear número con separadores de miles
  const formatGoal = (value) => {
    const digits = String(value || '').replace(/[^\d]/g, '');
    if (!digits) return '';
    return Number(digits).toLocaleString('es-CO');
  };

  // Validar campos requeridos
  const validateForm = () => {
    const errors = {};
    
    if (!business.name || !business.name.trim()) {
      errors.name = 'El nombre del negocio es requerido';
    }
    
    if (!business.type || !business.type.trim()) {
      errors.type = 'El tipo de negocio es requerido';
    }
    
    if (!business.goal || !String(business.goal).trim()) {
      errors.goal = 'La meta mensual es requerida';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

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
    
    // Limpiar error de validación cuando el usuario escribe
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    
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
    setCopied(true);
    setToast({ type: 'success', message: 'Código copiado ✅' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveAll = async () => {
    // Validar antes de guardar
    if (!validateForm()) {
      setToast({ type: 'error', message: 'Por favor completa los campos requeridos' });
      return;
    }
    
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#0f172a]">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-purple-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-pink-500 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-purple-400 animate-pulse" />
            </div>
          </div>
          <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Cargando Configuración
          </h2>
          <p className="text-white/60 text-sm">Obteniendo datos del negocio...</p>
          
          <div className="flex justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#0f172a] px-4">
        <div className="bg-gradient-to-br from-red-900/40 to-red-950/60 border border-red-500/30 rounded-xl p-6 max-w-lg">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-red-400 font-bold text-lg text-center mb-2">Error</h2>
          <p className="text-red-300 text-sm text-center">{error}</p>
          {!businessId && (
            <div className="mt-4 text-xs text-red-200/70">
              <p className="font-semibold mb-2">Debug info:</p>
              <pre className="bg-black/30 p-3 rounded-lg text-[10px] overflow-auto border border-red-500/20">
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
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] px-3 sm:px-4 py-6 sm:py-10">
      <div className="w-full max-w-5xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
          <h1 className="text-xl sm:text-2xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Configuración
          </h1>
        </div>

        {/* Código del negocio - Compacto en móvil */}
        {userRole === 'propietario_negocio' && business.code && (
          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/20 rounded-xl p-3 sm:p-5">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
              </div>
              <label className="text-sm sm:text-base font-bold text-white">
                Código del negocio
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={business.code}
                readOnly
                className="flex-1 min-w-0 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-sm sm:text-lg tracking-wider select-all focus:outline-none"
              />
              <button
                onClick={handleCopyCode}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 text-xs sm:text-sm flex-shrink-0 ${
                  copied
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Copiar</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[10px] sm:text-xs text-purple-200/60 mt-2">
              Comparte este código para que otros se unan
            </p>
          </div>
        )}

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Logo - Compacto en móvil */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 sm:p-5 border border-white/10">
              <h3 className="text-sm sm:text-base font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                <Upload className="w-4 h-4 text-purple-400" />
                Logo del negocio
              </h3>
              
              <div className="relative group">
                <img
                  src={logoPreview || business.image || logoFallback}
                  alt="Logo"
                  className="w-full max-w-[120px] sm:max-w-none mx-auto aspect-square object-contain bg-white rounded-lg sm:rounded-xl p-3 sm:p-6 border border-white/10"
                />
                <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg sm:rounded-xl">
                  <div className="text-center">
                    <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-white mx-auto mb-1" />
                    <span className="text-white font-semibold text-xs sm:text-sm">Cambiar</span>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePickLogo} />
                </label>
              </div>
              
              {pendingLogo && (
                <div className="mt-2 sm:mt-3 bg-green-500/20 border border-green-500/30 rounded-lg p-2">
                  <p className="text-[10px] sm:text-xs text-green-300 flex items-center gap-1.5">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                    Logo listo para guardar
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Formulario */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/10">
              <h3 className="text-sm sm:text-base font-bold text-white mb-4 sm:mb-5 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-400" />
                Información del negocio
              </h3>

              <div className="space-y-4 sm:space-y-5">
                {/* Nombre del negocio */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-white/90 mb-1.5">
                    <Building2 className="w-3.5 h-3.5 text-purple-400" />
                    Nombre del negocio <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={business.name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2.5 rounded-lg bg-white/5 border text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${
                      validationErrors.name 
                        ? 'border-red-500/50 focus:ring-red-500/50' 
                        : 'border-white/10'
                    }`}
                    placeholder="Ej: Mi Barbería"
                  />
                  {validationErrors.name && (
                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.name}
                    </p>
                  )}
                </div>

                {/* Tipo de negocio */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-white/90 mb-1.5">
                    <FileText className="w-3.5 h-3.5 text-purple-400" />
                    Tipo de negocio <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="type"
                    value={business.type}
                    onChange={handleChange}
                    className={`w-full px-3 py-2.5 rounded-lg bg-white/5 border text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${
                      validationErrors.type 
                        ? 'border-red-500/50 focus:ring-red-500/50' 
                        : 'border-white/10'
                    }`}
                    placeholder="Ej: Barbería, Peluquería, Spa"
                  />
                  {validationErrors.type && (
                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.type}
                    </p>
                  )}
                </div>

                {/* Meta mensual */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-white/90 mb-1.5">
                    <Target className="w-3.5 h-3.5 text-purple-400" />
                    Meta mensual <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 font-semibold">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      name="goal"
                      value={formatGoal(business.goal)}
                      onChange={handleChange}
                      placeholder="0"
                      className={`w-full pl-7 pr-3 py-2.5 rounded-lg bg-white/5 border text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-semibold ${
                        validationErrors.goal 
                          ? 'border-red-500/50 focus:ring-red-500/50' 
                          : 'border-white/10'
                      }`}
                    />
                  </div>
                  {validationErrors.goal && (
                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.goal}
                    </p>
                  )}
                </div>

                {/* Descripción */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-white/90 mb-1.5">
                    <FileText className="w-3.5 h-3.5 text-purple-400" />
                    ¿Por qué esta meta importa?
                  </label>
                  <textarea
                    name="description"
                    value={business.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
                    placeholder="Describe la importancia de alcanzar esta meta..."
                  />
                </div>

                {/* Botón guardar */}
                <button
                  onClick={handleSaveAll}
                  disabled={saving}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-xl w-full transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Guardar cambios
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[9999] px-4 py-2.5 rounded-xl text-white shadow-2xl font-semibold text-sm border
            ${toast.type === 'success' 
              ? 'bg-green-500/20 border-green-500/30 text-green-300' 
              : 'bg-red-500/20 border-red-500/30 text-red-300'}
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