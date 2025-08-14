// src/views/auth/ResetPassword.jsx
import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPasswordService } from '@services/authservice';

const passwordChecks = (pwd) => ({
  length: pwd.length >= 8,
  upper: /[A-Z]/.test(pwd),
  lower: /[a-z]/.test(pwd),
  number: /\d/.test(pwd),
  special: /[^A-Za-z0-9]/.test(pwd),
});

export default function ResetPassword() {
  const [sp] = useSearchParams();
  const navigate = useNavigate();

  const token = sp.get('token') || ''; // ← viene del link del correo
  const email = sp.get('email') || ''; // opcional, si lo adjuntas en el link

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null); // { type: 'success'|'error', text: string }

  const checks = useMemo(() => passwordChecks(password), [password]);
  const allGood = Object.values(checks).every(Boolean) && password === confirm && token;

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);

    if (!token) {
      setMsg({ type: 'error', text: 'El enlace no es válido o ya expiró.' });
      return;
    }
    if (!allGood) {
      setMsg({ type: 'error', text: 'Revisa los requisitos de la nueva contraseña.' });
      return;
    }

    try {
      setLoading(true);
      await resetPasswordService({ token, password });
      setMsg({ type: 'success', text: '¡Contraseña actualizada! Redirigiendo…' });
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const text = err?.response?.data?.message || err?.message || 'No se pudo actualizar la contraseña.';
      setMsg({ type: 'error', text });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl md:text-3xl font-semibold text-center text-color-oscuro-primario">
        Cambiar contraseña
      </h1>

      <p className="text-center text-color-oscuro-terciario mt-2">
        {email ? `Para: ${email}` : 'Ingresa tu nueva contraseña.'}
      </p>

      {msg && (
        <div
          className={`mt-4 rounded px-4 py-3 text-sm ${
            msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {msg.text}
        </div>
      )}

      {!token && (
        <div className="mt-4 rounded px-4 py-3 text-sm bg-red-50 text-red-700">
          No se encontró un token válido en el enlace.
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        {/* Nueva contraseña */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-color-oscuro-primario">Nueva contraseña</label>
          <div className="relative">
            <input
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="••••••••"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-color-oscuro-terciario hover:text-color-oscuro-secundario"
            >
              {showPwd ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>

          <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-color-oscuro-terciario">
            <li className={checks.length ? 'text-green-600' : ''}>• Mínimo 8 caracteres</li>
            <li className={checks.upper ? 'text-green-600' : ''}>• Una mayúscula</li>
            <li className={checks.lower ? 'text-green-600' : ''}>• Una minúscula</li>
            <li className={checks.number ? 'text-green-600' : ''}>• Un número</li>
            <li className={checks.special ? 'text-green-600' : ''}>• Un carácter especial</li>
          </ul>
        </div>

        {/* Confirmar */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-color-oscuro-primario">Confirmar contraseña</label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="••••••••"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-color-oscuro-terciario hover:text-color-oscuro-secundario"
            >
              {showConfirm ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          {confirm && password !== confirm && (
            <span className="text-xs text-red-600 mt-1">Las contraseñas no coinciden.</span>
          )}
        </div>

        <button
          type="submit"
          disabled={!allGood || loading}
          className="w-full bg-color-neutro-terciario text-color-oscuro-primario py-3 rounded-lg font-semibold hover:bg-color-neutro-cuaternario transition disabled:opacity-60"
        >
          {loading ? 'Guardando...' : 'Cambiar contraseña'}
        </button>

        <button
          type="button"
          onClick={() => navigate('/login')}
          className="w-full text-sm text-color-neutro-primario hover:underline mt-1"
        >
          Volver al inicio de sesión
        </button>
      </form>
    </div>
  );
}
