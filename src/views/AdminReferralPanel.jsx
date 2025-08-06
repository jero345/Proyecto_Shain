import { useState } from "react";

export const AdminReferralPanel = () => {
  const [users, setUsers] = useState([
    { _id: 1, username: "juanito", referralCode: "REF123", referralsCount: 3 },
    { _id: 2, username: "pepita", referralCode: "PEP456", referralsCount: 1 },
    { _id: 3, username: "lola", referralCode: "", referralsCount: 0 },
  ]);

  const handleReferralCodeChange = (userId, newCode) => {
    setUsers((prev) =>
      prev.map((u) =>
        u._id === userId ? { ...u, referralCode: newCode } : u
      )
    );
    console.log(`Nuevo código para ${userId}: ${newCode}`);
  };

  const handleViewReferrals = (user) => {
    alert(
      `Mostrando referidos de ${user.username}\n\nCantidad: ${user.referralsCount}`
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-[#66B4FF] mb-6 flex items-center gap-2">
          📊 Panel de Referidos (Admin)
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-gray-600 dark:text-gray-300 text-sm uppercase bg-[#f1f5f9] dark:bg-gray-700">
                <th className="px-4 py-2 rounded-l-lg">Usuario</th>
                <th className="px-4 py-2">Código Asignado</th>
                <th className="px-4 py-2 text-center"># Referidos</th>
                <th className="px-4 py-2 rounded-r-lg text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition rounded-xl shadow-sm"
                >
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">
                    {user.username}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      defaultValue={user.referralCode}
                      onBlur={(e) =>
                        handleReferralCodeChange(user._id, e.target.value)
                      }
                      placeholder="No asignado"
                      className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg px-3 py-1 w-36 focus:outline-none focus:ring-2 focus:ring-[#66B4FF]"
                    />
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-[#66B4FF]">
                    {user.referralsCount}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleViewReferrals(user)}
                      className="bg-[#66B4FF] hover:bg-[#559adf] text-white text-sm font-semibold px-4 py-1.5 rounded-lg shadow transition"
                    >
                      Ver referidos
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
