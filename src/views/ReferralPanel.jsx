import { useEffect, useState } from "react";
import { useAuth } from "@auth/useAuth";

export const ReferralPanel = () => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState([]);

  useEffect(() => {
    // 🔹 Datos temporales hasta que conectes al backend real
    const fakeReferrals = [
      { username: "juanito", email: "juanito@mail.com" },
      { username: "pepita", email: "pepita@mail.com" },
      { username: "lola", email: "lola@mail.com" },
    ];
    setReferrals(fakeReferrals);
  }, []);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black px-6 py-12 flex justify-center">
      <div className="w-full max-w-4xl backdrop-blur-xl bg-gray-800/40 border border-white/10 rounded-3xl shadow-2xl p-8">
        
        {/* Header */}
        <h2 className="text-4xl font-extrabold text-white mb-4 drop-shadow-lg flex items-center gap-2">
          🎉 Mis Referidos
        </h2>

        <p className="text-gray-300 mb-6 text-lg">
          Comparte tu código y gana recompensas por cada amigo que se registre.
        </p>

        {/* Código Personal */}
        <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-6 flex items-center justify-between hover:bg-gray-900/70 transition-all">
          <div>
            <p className="text-gray-400 text-sm">Tu código de referido</p>
            <p className="text-2xl font-bold text-white tracking-wider">
              {user?.referralCode || "AUN-NO-ASIGNADO"}
            </p>
          </div>

          <button
            onClick={() =>
              navigator.clipboard.writeText(user?.referralCode || "")
            }
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition-all text-white font-semibold shadow-lg hover:shadow-blue-500/30"
          >
            Copiar Código
          </button>
        </div>

        {/* Contador */}
        <div className="mt-8">
          <p className="text-xl font-semibold text-gray-200">
            Personas que usaron tu código:{" "}
            <span className="text-blue-400 font-bold">{referrals.length}</span>
          </p>
        </div>

        {/* Lista */}
        <div className="mt-6">
          {referrals.length > 0 ? (
            <ul className="divide-y divide-gray-700/40">
              {referrals.map((ref, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center py-4 hover:bg-gray-800/40 px-3 rounded-xl transition-all"
                >
                  <span className="text-white font-medium">{ref.username}</span>
                  <span className="text-gray-400 text-sm">{ref.email}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 mt-4">Aún no tienes referidos.</p>
          )}
        </div>
      </div>
    </div>
  );
};
