import { useEffect, useState } from "react";
import { useAuth } from "@auth/useAuth";

export const ReferralPanel = () => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState([]);

  useEffect(() => {
    // 🔹 Simulación de datos hasta conectar al backend
    const fakeReferrals = [
      { username: "juanito", email: "juanito@mail.com" },
      { username: "pepita", email: "pepita@mail.com" },
      { username: "lola", email: "lola@mail.com" },
    ];
    setReferrals(fakeReferrals);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-10">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-extrabold text-[#66B4FF] mb-4">
          🎉 Mis Referidos
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          Comparte tu código y gana recompensas cuando tus amigos se registren.
        </p>

        {/* Código personal */}
        <div className="bg-[#f5f9ff] dark:bg-gray-700 rounded-lg p-4 flex items-center justify-between mb-6">
          <div>
            <p className="text-gray-500 dark:text-gray-300 text-sm">
              Tu código de referido
            </p>
            <p className="text-xl font-bold text-gray-800 dark:text-white">
              {user?.referralCode || "AUN-NO-ASIGNADO"}
            </p>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(user?.referralCode || "")}
            className="bg-[#66B4FF] text-white px-4 py-2 rounded-lg hover:bg-[#559adf] transition"
          >
            Copiar Código
          </button>
        </div>

        {/* Contador de referidos */}
        <div className="mb-6">
          <p className="text-lg font-semibold">
            Personas que usaron tu código:{" "}
            <span className="text-[#66B4FF]">{referrals.length}</span>
          </p>
        </div>

        {/* Lista de referidos */}
        {referrals.length > 0 ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-600">
            {referrals.map((ref, idx) => (
              <li
                key={idx}
                className="flex justify-between items-center py-3"
              >
                <span className="text-gray-800 dark:text-gray-200">
                  {ref.username}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  {ref.email}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            Aún no tienes referidos.
          </p>
        )}
      </div>
    </div>
  );
};
