import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { getEmployees } from "@services/employeesService";
import { axiosApi } from "@services/axiosclient";

export default function Employees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Obtener el mes y año actual
  const getCurrentMonthYear = () => {
    const now = new Date();
    return {
      month: now.getMonth(),
      year: now.getFullYear()
    };
  };

  // Filtrar movimientos del mes actual
  const filterMovementsByCurrentMonth = (movements) => {
    const { month, year } = getCurrentMonthYear();

    return movements.filter((movement) => {
      // El movimiento puede tener date, createdAt, o fecha
      const dateStr = movement.date || movement.createdAt || movement.fecha;
      if (!dateStr) return false;

      const movementDate = new Date(dateStr);

      return (
        movementDate.getMonth() === month &&
        movementDate.getFullYear() === year
      );
    });
  };

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

        // Obtener los movimientos de cada empleado
        const employeesWithMovements = await Promise.all(
          data.map(async (emp) => {
            try {
              const movementsRes = await axiosApi.get(
                `movements/user/${emp._id || emp.id}`,
                { withCredentials: true }
              );
              // Backend devuelve { data: { movements: [...], totalExpenses, totalIncomes } }
              const responseData = movementsRes?.data?.data || movementsRes?.data || {};
              const allMovements = Array.isArray(responseData) ? responseData : (responseData?.movements || []);

              // Filtrar solo los movimientos del mes actual
              const currentMonthMovements = filterMovementsByCurrentMonth(allMovements);

              return { ...emp, movements: currentMonthMovements };
            } catch (err) {
              return {
                ...emp,
                movements: []
              };
            }
          })
        );


        setEmployees(employeesWithMovements);
      } catch (err) {

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

  // 🌀 Loader visual mejorado
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-purple-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-pink-500 animate-spin" style={{ animationDuration: '1.5s' }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Users className="w-8 h-8 text-purple-400 animate-pulse" />
            </div>
          </div>
          <p className="text-white text-xl font-semibold">Cargando empleados...</p>
        </div>
      </div>
    );
  }

  // ⚠️ Error visual mejorado
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#0f172a]">
        <div className="text-center">
          <p className="text-red-400 text-xl font-semibold mb-4">❌ {error}</p>
          <button
            onClick={handleRetry}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-xl transition-all text-white font-semibold shadow-lg hover:scale-105"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // 📊 Render normal
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#0f172a] px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header mejorado */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1.5 h-12 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Equipo
              </h1>
              <p className="text-white/60 mt-1">
                Rendimiento del mes
              </p>
            </div>
          </div>
        </div>

        {employees.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl px-12 py-16 border border-white/10">
              <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-xl text-white/60 font-medium">
                No hay empleados registrados
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map((emp, index) => {
              const movements = emp.movements || [];

              const totalIngresos = movements
                .filter((m) => m.type === "ingreso")
                .reduce((sum, m) => sum + Number(m.value || 0), 0) || 0;

              const totalEgresos = movements
                .filter((m) => m.type === "egreso")
                .reduce((sum, m) => sum + Number(m.value || 0), 0) || 0;

              return (
                <div
                  key={emp._id || emp.id || index}
                  onClick={() => navigate(`/dashboard/employees/${emp._id || emp.id}`)}
                  className="group cursor-pointer bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 border border-white/10 hover:border-purple-500/50 p-6"
                >
                  {/* Header de la tarjeta */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">
                        {emp.name || "Sin nombre"} {emp.lastName || ""}
                      </h2>
                      <p className="text-sm text-slate-400 capitalize">
                        {emp.role || "Sin rol"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full font-medium border border-purple-500/30">
                        {emp.businessCode}
                      </span>
                      <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>

                  {/* Ingresos del mes - Card destacada */}
                  <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-2 border-emerald-500/30 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                      <p className="text-xs text-emerald-300 font-semibold">
                        Ingresos del mes
                      </p>
                    </div>
                    <p className="text-2xl font-extrabold text-emerald-400">
                      ${totalIngresos.toLocaleString("es-CO")}
                    </p>
                  </div>

                  {/* Egresos del mes */}
                  <div className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-rose-400" />
                      <p className="text-xs text-slate-400 font-medium">
                        Egresos del mes
                      </p>
                    </div>
                    <p className="text-lg font-bold text-rose-400">
                      ${totalEgresos.toLocaleString("es-CO")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
