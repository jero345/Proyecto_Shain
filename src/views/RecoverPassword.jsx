import { useState } from 'react';

export const RecoverPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      alert('Por favor ingresa tu correo electrónico.');
      return;
    }
    // Aquí va tu lógica para enviar el correo de recuperación.
    console.log('📧 Enviando link de recuperación a:', email);
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#a32063] via-[#4b1d69] to-[#0b0b2f] px-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-2">Recuperar Contraseña</h1>
        <p className="text-sm text-white/70 mb-6">
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        {sent ? (
          <div className="text-center text-green-400 font-semibold">
            ✅ Link enviado correctamente. Revisa tu correo.
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
                className="w-full px-4 py-2 rounded-md bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#a32063]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#a32063] to-[#4b1d69] hover:opacity-90 text-white font-semibold py-2 rounded-full transition"
            >
              Enviar enlace de recuperación
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <a href="/" className="text-xs text-white/70 underline hover:text-white">
            Volver al inicio de sesión
          </a>
        </div>
      </div>
    </div>
  );
};
