import { useNavigate } from 'react-router-dom';
import { FaSadTear, FaCreditCard } from 'react-icons/fa';

export const TrialExpired = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-400 to-purple-600 text-white px-6">
      <FaSadTear className="text-7xl mb-6" />
      <h1 className="text-4xl font-bold mb-4">Tu período de prueba ha expirado</h1>
      <p className="text-lg mb-6 text-center max-w-xl">
        Para continuar disfrutando de todos los beneficios de nuestra plataforma, actualiza tu plan y sigue creciendo con nosotros 🚀.
      </p>
      <button
        onClick={() => window.location.href = "https://shain.finance/"}
        className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-3 rounded-full flex items-center gap-2"
      >
        <FaCreditCard /> Actualizar Plan
      </button>
      <button
        onClick={() => navigate('/')}
        className="mt-4 underline text-sm"
      >
        Volver al inicio de sesión
      </button>
    </div>
  );
};
