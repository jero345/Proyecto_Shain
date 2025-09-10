// src/views/AdminReferralPanel.jsx
import { useEffect, useState } from "react";
import {
  getUsersWithReferralCodeService,
  updateReferralCodeService,
  getUsersByReferredCodeService,
} from "@services/refferalService";

export const AdminReferralPanel = () => {
  const [rows, setRows] = useState([]); // { id, username, referralCode, referralsCount }
  const [loading, setLoading] = useState(true);

  // estados por-fila
  const [savingId, setSavingId] = useState(null);
  const [draftCodes, setDraftCodes] = useState({}); // id -> string

  // paginación
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);

  // modal (ver referidos)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalList, setModalList] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data, totalPages: tp } = await getUsersWithReferralCodeService(page, limit);

      // Si backend NO manda referralsCount, lo calculamos
      const enriched = await Promise.all(
        data.map(async (u) => {
          const id = u.id || u._id;
          const username = u.username;
          const code = u.referralCode || "";
          let count = u.referralsCount;
          if (count === undefined) {
            if (!code) count = 0;
            else {
              const list = await getUsersByReferredCodeService(code, 1, 1000);
              count = Array.isArray(list) ? list.length : 0;
            }
          }
          return { id, username, referralCode: code, referralsCount: count };
        })
      );

      setRows(enriched);
      // inicializa borradores con los códigos actuales
      setDraftCodes(
        Object.fromEntries(enriched.map((r) => [r.id, r.referralCode || ""]))
      );
      setTotalPages(tp || 1);
    } catch (e) {
      console.error("❌ Error cargando usuarios:", e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleDraftChange = (id, val) => {
    setDraftCodes((d) => ({ ...d, [id]: val }));
  };

  const handleSaveCode = async (row) => {
    const userId = row.id;
    const newCode = (draftCodes[userId] ?? "").trim();
    const prevRows = rows;

    // Detecta si cambió
    const changed = (row.referralCode || "") !== newCode;
    if (!changed && savingId !== userId) return;

    setSavingId(userId);

    // Optimista: actualiza código en la tabla
    setRows((r) => r.map((x) => (x.id === userId ? { ...x, referralCode: newCode } : x)));

    try {
      await updateReferralCodeService(userId, newCode);

      // Recalcula #referidos para el nuevo código
      let newCount = 0;
      if (newCode) {
        const list = await getUsersByReferredCodeService(newCode, 1, 1000);
        newCount = Array.isArray(list) ? list.length : 0;
      }
      setRows((r) => r.map((x) => (x.id === userId ? { ...x, referralsCount: newCount } : x)));
    } catch (e) {
      console.error("❌ Error actualizando código:", e);
      setRows(prevRows); // rollback
      // también revierte el borrador al valor previo del row
      setDraftCodes((d) => ({ ...d, [userId]: row.referralCode || "" }));
      alert("No se pudo actualizar el código.");
    } finally {
      setSavingId(null);
    }
  };

  const handleViewReferrals = async (row) => {
    setModalTitle(`Referidos de ${row.username}`);
    setModalOpen(true);
    setModalLoading(true);
    try {
      const list = row.referralCode
        ? await getUsersByReferredCodeService(row.referralCode)
        : [];
      setModalList(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error("❌ Error trayendo referidos:", e);
      setModalList([]);
    } finally {
      setModalLoading(false);
    }
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
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                    Cargando...
                  </td>
                </tr>
              ) : rows.length ? (
                rows.map((row) => {
                  const draft = draftCodes[row.id] ?? "";
                  const changed = (row.referralCode || "") !== (draft || "");
                  const disableSave = savingId === row.id || !changed;

                  return (
                    <tr
                      key={row.id}
                      className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition rounded-xl shadow-sm"
                    >
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">
                        {row.username}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <input
                            value={draft}
                            onChange={(e) => handleDraftChange(row.id, e.target.value)}
                            placeholder="No asignado"
                            className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg px-3 py-1 w-44 focus:outline-none focus:ring-2 focus:ring-[#66B4FF]"
                          />
                          <button
                            onClick={() => handleSaveCode(row)}
                            disabled={disableSave}
                            className="px-3 py-1.5 text-sm rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                          >
                            {savingId === row.id ? "Guardando..." : "Cambiar código"}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Deja vacío para quitar el código.
                        </p>
                      </td>

                      <td className="px-4 py-3 text-center font-semibold text-[#66B4FF]">
                        {row.referralsCount}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleViewReferrals(row)}
                          className="bg-[#66B4FF] hover:bg-[#559adf] text-white text-sm font-semibold px-4 py-1.5 rounded-lg shadow transition"
                          disabled={!row.referralCode}
                          title={!row.referralCode ? "Este usuario no tiene código" : ""}
                        >
                          Ver referidos
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                    Sin datos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex justify-center mt-4 gap-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1 || loading}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="px-3 py-1">Página {page} de {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages || loading}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* Modal referidos */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-bold">{modalTitle}</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-500 hover:text-gray-800 dark:hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-5 max-h-[60vh] overflow-y-auto">
              {modalLoading ? (
                <p className="text-gray-500">Cargando...</p>
              ) : modalList.length ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {modalList.map((r, i) => (
                    <li key={r.id || r._id || i} className="py-2 flex justify-between">
                      <span>{r.username || r.name || "—"}</span>
                      <span className="text-sm text-gray-500">{r.email || "—"}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">Este código aún no tiene referidos.</p>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-right">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
