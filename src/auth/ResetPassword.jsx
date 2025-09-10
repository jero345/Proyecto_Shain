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

  const token = sp.get('token') || '';
  const email = sp.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

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
    <div className="min-h-screen flex items-center justify-center bg-[#0F111A] px-4">
      <div className="w-full max-w-md bg-[#1A1C28] rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center text-white">
          Cambiar contraseña 🔑
        </h1>

        <p className="text-center text-gray-400 mt-2">
          {email ? `Para: ${email}` : 'Ingresa tu nueva contraseña.'}
        </p>

        {msg && (
          <div
            className={`mt-4 rounded px-4 py-3 text-sm ${
              msg.type === 'success'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
            }`}
          >
            {msg.text}
          </div>
        )}

        {!token && (
          <div className="mt-4 rounded px-4 py-3 text-sm bg-red-500/20 text-red-400">
            No se encontró un token válido en el enlace.
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          {/* Nueva contraseña */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-300">Nueva contraseña</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#252836] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-200"
              >
                {showPwd ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>

            <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-gray-400">
              <li className={checks.length ? 'text-green-400' : ''}>• Mínimo 8 caracteres</li>
              <li className={checks.upper ? 'text-green-400' : ''}>• Una mayúscula</li>
              <li className={checks.lower ? 'text-green-400' : ''}>• Una minúscula</li>
              <li className={checks.number ? 'text-green-400' : ''}>• Un número</li>
              <li className={checks.special ? 'text-green-400' : ''}>• Un carácter especial</li>
            </ul>
          </div>

          {/* Confirmar */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-300">Confirmar contraseña</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full bg-[#252836] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-200"
              >
                {showConfirm ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            {confirm && password !== confirm && (
              <span className="text-xs text-red-400 mt-1">Las contraseñas no coinciden.</span>
            )}
          </div>

          <button
            type="submit"
            disabled={!allGood || loading}
            className="w-full bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] text-white py-3 rounded-lg font-semibold shadow-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Cambiar contraseña'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full text-sm text-gray-400 hover:text-gray-200 mt-2"
          >
            Volver al inicio de sesión
          </button>
        </form>
      </div>
    </div>
  );
}
