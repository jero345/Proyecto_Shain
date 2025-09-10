import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPasswordService } from '@services/authService';

export const RecoverPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [serverMsg, setServerMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerMsg('');
    setErrorMsg('');

    const clean = String(email || '').trim();
    if (!clean) {
      setErrorMsg('Ingresa tu correo.');
      return;
    }

    try {
      setLoading(true);
      const r = await forgotPasswordService(clean);
      // Muestra mensaje del backend si viene
      setServerMsg(r?.message || 'Hemos enviado un enlace a tu correo.');
      setSent(true);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'No se pudo enviar el enlace. Intenta de nuevo.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#a32063] via-[#4b1d69] to-[#0b0b2f] px-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-2">Recuperar Contraseña</h1>
        <p className="text-sm text-white/70 mb-6">
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        {errorMsg && (
          <div className="mb-4 rounded border border-red-400/40 bg-red-500/10 text-red-300 px-3 py-2 text-sm">
            {errorMsg}
          </div>
        )}

        {sent ? (
          <div className="rounded border border-green-400/40 bg-green-500/10 text-green-300 px-3 py-2 text-sm">
            ✅ {serverMsg || 'Revisa tu correo (y la carpeta de spam).'}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-white mb-1">Correo electrónico</label>
              <input
                type="email"
                placeholder="tuemail@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-2 rounded-md bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 ${
                  errorMsg ? 'focus:ring-red-400' : 'focus:ring-[#a32063]'
                }`}
                autoComplete="email"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#a32063] to-[#4b1d69] hover:opacity-90 text-white font-semibold py-2 rounded-full transition disabled:opacity-60"
            >
              {loading ? 'Enviando…' : 'Enviar enlace de recuperación'}
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <Link to="/" className="text-xs text-white/70 underline hover:text-white">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecoverPassword;
