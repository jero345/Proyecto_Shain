import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEmployees } from "@services/employeesService";
import { axiosApi } from "@services/axiosclient";

export default function Employees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEmployees = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getEmployees();
        if (!data.length) {
          setError("No hay empleados registrados actualmente.");
          setEmployees([]);
          setLoading(false);
          return;
        }

        // Obtener el summary de cada empleado
        const employeesWithSummary = await Promise.all(
          data.map(async (emp) => {
            try {
              const summaryRes = await axiosApi.get(
                `movements/summary/${emp._id || emp.id}`,
                { withCredentials: true }
              );
              const summary = summaryRes?.data?.data || summaryRes?.data || {};
              
              console.log(`📊 Summary de ${emp.name}:`, summary);
              
              return { ...emp, summary };
            } catch (err) {
              console.error(`❌ Error obteniendo summary para ${emp.name}:`, err);
              return { 
                ...emp, 
                summary: { 
                  totalTransactionsMonth: {
                    incomes: 0,
                    expenses: 0
                  },
                  monthBalance: 0
                } 
              };
            }
          })
        );

        console.log("👥 Empleados con summary cargados:", employeesWithSummary);
        setEmployees(employeesWithSummary);
      } catch (err) {
        console.error("❌ Error cargando empleados:", err);
        setError(err.message || "Error al cargar los empleados.");
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
  }, []);

  const handleRetry = () => {
    setError("");
    setLoading(true);
    setTimeout(() => window.location.reload(), 400);
  };

  // 🌀 Loader visual
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white">
        <div className="animate-spin h-10 w-10 border-4 border-t-transparent border-purple-400 rounded-full"></div>
        <p className="mt-3 text-white/80">Cargando empleados...</p>
      </div>
    );
  }

  // ⚠️ Error visual
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-300">
        <p className="text-lg font-medium text-center mb-3">{error}</p>
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // 📊 Render normal
  return (
    <div className="p-6 min-h-screen bg-[#0b0b2f] text-white">
      <h1 className="text-2xl font-bold mb-6 text-white">
        Rendimiento del Mes
      </h1>

      {employees.length === 0 ? (
        <p className="text-gray-400 text-center mt-10">
          No hay empleados registrados.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((emp, index) => {
            // Extraer datos de la estructura correcta
            const totalIngresos = emp.summary?.totalTransactionsMonth?.incomes ?? 0;
            const totalEgresos = emp.summary?.totalTransactionsMonth?.expenses ?? 0;
            const balance = emp.summary?.monthBalance ?? (totalIngresos - totalEgresos);

            return (
              <div
                key={emp._id || emp.id || index}
                onClick={() =>
                  navigate(`/dashboard/employees/${emp._id || emp.id}`)
                }
                className="cursor-pointer bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-md hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 border border-slate-700 hover:border-purple-500 p-5"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {emp.name || "Sin nombre"} {emp.lastName || ""}
                    </h2>
                    <p className="text-sm text-slate-400 capitalize">
                      {emp.role || "Sin rol"}
                    </p>
                  </div>
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-md font-medium border border-purple-500/30">
                    {emp.businessCode}
                  </span>
                </div>

                <div className="text-sm text-slate-300 space-y-1 mb-4">
                  <p>
                    <strong className="text-slate-400">Correo:</strong>{" "}
                    {emp.email || "Sin correo registrado"}
                  </p>
                  <p>
                    <strong className="text-slate-400">Total de ingresos:</strong>{" "}
                    <span className="text-emerald-400 font-semibold">
                      ${totalIngresos.toLocaleString("es-CO")}
                    </span>
                  </p>
                  <p>
                    <strong className="text-slate-400">Total de egresos:</strong>{" "}
                    <span className="text-rose-400 font-semibold">
                      ${totalEgresos.toLocaleString("es-CO")}
                    </span>
                  </p>
                </div>

                <div
                  className={`rounded-lg p-3 text-center font-semibold border ${
                    balance >= 0
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                  }`}
                >
                  Balance mensual: ${balance.toLocaleString("es-CO")}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}