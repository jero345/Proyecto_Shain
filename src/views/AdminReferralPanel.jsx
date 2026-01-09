// src/views/AdminReferralPanel.jsx
import { useEffect, useState } from "react";
import {
  getUsersWithReferralCodeService,
  updateReferralCodeService,
  getUsersByReferredCodeService,
} from "@services/refferalService";
import { Check, Copy, Loader2, Search, Users, X } from "lucide-react";

export const AdminReferralPanel = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [draftCodes, setDraftCodes] = useState({});
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);

  const [modal, setModal] = useState({
    open: false,
    loading: false,
    title: "",
    list: [],
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const { data, totalPages: tp } = await getUsersWithReferralCodeService(page, limit);

      const enriched = await Promise.all(
        data.map(async (u) => {
          const id = u.id || u._id;
          const username = u.username;
          const code = u.referralCode || "";

          let count =
            typeof u.referralsCount === "number"
              ? u.referralsCount
              : code
              ? (await getUsersByReferredCodeService(code, 1, 1000)).length || 0
              : 0;

          return { id, username, referralCode: code, referralsCount: count };
        })
      );

      setRows(enriched);
      setDraftCodes(Object.fromEntries(enriched.map((r) => [r.id, r.referralCode ?? ""])));
      setTotalPages(tp || 1);
    } catch (e) {
      console.error("❌ Error cargando datos:", e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page]);

  const handleDraftChange = (id, value) => {
    setDraftCodes((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async (row) => {
    const id = row.id;
    const newCode = (draftCodes[id] ?? "").trim();
    const changed = (row.referralCode || "") !== newCode;
    if (!changed) return;

    setSavingId(id);
    const prevRows = [...rows];

    // Optimistic UI
    setRows((r) => r.map((x) => (x.id === id ? { ...x, referralCode: newCode } : x)));

    try {
      await updateReferralCodeService(id, newCode);
      const list = newCode ? await getUsersByReferredCodeService(newCode, 1, 1000) : [];
      const newCount = Array.isArray(list) ? list.length : 0;

      setRows((r) =>
        r.map((x) => (x.id === id ? { ...x, referralsCount: newCount } : x))
      );
    } catch (error) {
      console.error("❌ Error actualizando código:", error);
      alert("No se pudo actualizar el código.");
      setRows(prevRows);
      setDraftCodes((d) => ({ ...d, [id]: row.referralCode || "" }));
    } finally {
      setSavingId(null);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const openReferralsModal = async (row) => {
    setModal({
      open: true,
      loading: true,
      title: `Referidos de ${row.username}`,
      list: [],
    });

    try {
      const list = row.referralCode
        ? await getUsersByReferredCodeService(row.referralCode)
        : [];
      setModal((m) => ({ ...m, list: list || [], loading: false }));
    } catch (err) {
      console.error("❌ Error obteniendo referidos:", err);
      setModal((m) => ({ ...m, loading: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-3">
            Panel de Referidos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administra códigos de referidos y visualiza estadísticas
          </p>
        </div>

        {/* Card Principal */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-2xl">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Gestión de Referidos</h2>
                <p className="text-blue-100">Total de usuarios con código: {rows.length}</p>
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    <th className="pb-4 pl-2">Usuario</th>
                    <th className="pb-4">Código de Referido</th>
                    <th className="pb-4 text-center">Referidos</th>
                    <th className="pb-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="text-center py-16">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
                        <p className="mt-3 text-gray-500">Cargando usuarios...</p>
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-16 text-gray-500">
                        No se encontraron usuarios con código de referido.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => {
                      const draft = draftCodes[row.id] ?? "";
                      const hasChanged = (row.referralCode || "") !== draft.trim();
                      const isSaving = savingId === row.id;

                      return (
                        <tr
                          key={row.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 group"
                        >
                          {/* Usuario */}
                          <td className="py-5 pl-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold">
                                {row.username[0].toUpperCase()}
                              </div>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {row.username}
                              </span>
                            </div>
                          </td>

                          {/* Código */}
                          <td className="py-5">
                            <div className="flex items-center gap-3 max-w-md">
                              <div className="relative flex-1">
                                <input
                                  type="text"
                                  value={draft}
                                  onChange={(e) => handleDraftChange(row.id, e.target.value)}
                                  placeholder="Ej: VIP2025"
                                  className={`w-full px-4 py-3 rounded-xl border ${
                                    hasChanged
                                      ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20"
                                      : "border-gray-300 dark:border-gray-600"
                                  } focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all pr-12`}
                                />
                                {hasChanged && (
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                                  </div>
                                )}
                              </div>

                              <button
                                onClick={() => handleSave(row)}
                                disabled={!hasChanged || isSaving}
                                className={`px-5 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                                  hasChanged
                                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                                } disabled:opacity-60`}
                              >
                                {isSaving ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Guardando
                                  </>
                                ) : hasChanged ? (
                                  <>
                                    <Check className="w-4 h-4" />
                                    Guardar
                                  </>
                                ) : (
                                  "Sin cambios"
                                )}
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 ml-1">
                              Deja vacío para eliminar • Se puede copiar con el botón →
                            </p>
                          </td>

                          {/* Cantidad de referidos */}
                          <td className="py-5 text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full">
                              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              <span className="font-bold text-xl text-blue-600 dark:text-blue-400">
                                {row.referralsCount}
                              </span>
                            </div>
                          </td>

                          {/* Acciones */}
                          <td className="py-5 text-center">
                            <button
                              onClick={() => openReferralsModal(row)}
                              disabled={!row.referralCode}
                              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 mx-auto"
                            >
                              <Search className="w-4 h-4" />
                              Ver Referidos
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="flex items-center justify-between mt-8">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Mostrando página <span className="font-bold">{page}</span> de{" "}
                <span className="font-bold">{totalPages}</span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="px-6 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Anterior
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Premium */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-white">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  <Users className="w-8 h-8" />
                  {modal.title}
                </h3>
                <button
                  onClick={() => setModal({ ...modal, open: false })}
                  className="p-2 hover:bg-white/20 rounded-xl transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {modal.loading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
                </div>
              ) : modal.list.length > 0 ? (
                <div className="grid gap-4">
                  {modal.list.map((user, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {user.username[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {user.username}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(user.username)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
                        title="Copiar nombre de usuario"
                      >
                        <Copy className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-12">
                  Este usuario aún no tiene referidos.
                </p>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 text-right">
              <button
                onClick={() => setModal({ ...modal, open: false })}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-105"
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