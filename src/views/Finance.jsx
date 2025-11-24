import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AlertTriangle, BarChart, Target, Users } from "lucide-react";
import { Chart } from "@components/Chart";
import { MiniCardChart } from "@components/MiniCardChart";
import { getDailySummaryService } from "@services/addMovementService";
import { getEmployees } from "@services/employeesService";
import { useAuth } from "@context/AuthContext";
import { TrendingUp, TrendingDown } from "lucide-react";
import { ROLES, normalizeRole } from "../constant/roles";

export const Finance = () => {
  const navigate = useNavigate();
  const { user } = useAuth() || {};
  const userId = user?.id || user?._id || user?.userId || "";
  const userRole = normalizeRole(user?.role || "");

  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [goal, setGoal] = useState(5000);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [chartPeriod, setChartPeriod] = useState("7days");

  const todayDate = new Date().toISOString().split("T")[0];
  const isOwner = userRole === ROLES.OWNER;

  const parseGoal = (v) => {
    if (v == null) return 0;
    const n = Number(String(v).replace(/[^\d.]/g, ""));
    return Number.isFinite(n) ? n : 0;
  };

  // Convertir movimientos para la gráfica
  const buildChartFromMovements = (movements) => {
    console.log('🏗️ buildChartFromMovements - Entrada:', movements);
    
    const grouped = {};
    (Array.isArray(movements) ? movements : []).forEach((m) => {
      console.log('  📌 Procesando movimiento:', m);
      
      const date = new Date(m.date).toLocaleDateString("es-CO");
      if (!grouped[date]) grouped[date] = { date, Ingresos: 0, Egresos: 0 };
      const t = (m.type || "").toLowerCase();
      
      console.log(`    Fecha: ${date}, Tipo: ${t}, Valor: ${m.value}`);
      
      if (t === "ingreso") grouped[date].Ingresos += Number(m.value) || 0;
      if (t === "egreso") grouped[date].Egresos += Number(m.value) || 0;
    });

    console.log('📊 Datos agrupados:', grouped);

    const result = Object.values(grouped).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    
    console.log('✅ buildChartFromMovements - Resultado final:', result);
    return result;
  };

  // Filtrar movimientos según el período seleccionado
  const filterMovementsByPeriod = (movements, period) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return movements.filter((m) => {
      const movementDate = new Date(m.date);
      
      switch (period) {
        case "7days":
          const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setDate(today.getDate() - 7);
          return movementDate >= sevenDaysAgo;
        
        case "month":
          return (
            movementDate.getMonth() === now.getMonth() &&
            movementDate.getFullYear() === now.getFullYear()
          );
        
        case "year":
          return movementDate.getFullYear() === now.getFullYear();
        
        case "all":
        default:
          return true;
      }
    });
  };

  // Cargar meta mensual (goal) desde cache
  useEffect(() => {
    const cached = localStorage.getItem("business");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed?.goal != null) {
          setGoal(parseGoal(parsed.goal));
        }
      } catch {}
    }

    const onStorage = (e) => {
      if (e.key === "business" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed?.goal != null) {
            setGoal(parseGoal(parsed.goal));
          }
        } catch (error) {
          console.error('❌ Error al parsear los datos del negocio', error);
        }
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
    };
  }, [userId]);

  // Resumen y movimientos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Cargar el resumen usando el servicio correcto
        const summaryData = await getDailySummaryService();
        
        console.log('📊 Summary data recibido:', summaryData);
        
        if (summaryData) {
          setSummary(summaryData);
          localStorage.setItem("financeSummary", JSON.stringify(summaryData));
        }

        // 👇 OBTENER BUSINESS ID DESDE LOCALSTORAGE
        let businessId = null;
        
        try {
          const cachedBusiness = localStorage.getItem("business");
          if (cachedBusiness) {
            const parsed = JSON.parse(cachedBusiness);
            businessId = parsed?._id || parsed?.id;
          }
        } catch (e) {
          console.warn('⚠️ Error parseando business desde localStorage');
        }
        
        // Fallback: intentar desde user
        if (!businessId) {
          businessId = user?.businessId || user?.business?._id || user?.business?.id;
        }
        
        console.log('🏢 Business ID encontrado:', businessId);

        if (businessId) {
          try {
            console.log('🔄 Cargando movimientos del negocio...');
            
            // Importar el servicio
            const { getBusinessFinanceSummary } = await import("@services/financeService");
            
            // Hacer 2 peticiones en paralelo
            console.log('📞 Llamando a getBusinessFinanceSummary...');
            const [ingresosData, egresosData] = await Promise.all([
              getBusinessFinanceSummary(businessId, 'ingreso'),
              getBusinessFinanceSummary(businessId, 'egreso')
            ]);

            console.log('💰 Respuesta INGRESOS:', ingresosData);
            console.log('💸 Respuesta EGRESOS:', egresosData);

            // Combinar los movimientos
            const allMovements = [
              ...(Array.isArray(ingresosData) ? ingresosData.map(m => ({ ...m, type: 'ingreso' })) : []),
              ...(Array.isArray(egresosData) ? egresosData.map(m => ({ ...m, type: 'egreso' })) : [])
            ];

            console.log('📦 Total movimientos combinados:', allMovements.length);
            console.log('📦 Movimientos:', allMovements);

            if (allMovements.length > 0) {
              const filteredMovements = filterMovementsByPeriod(allMovements, chartPeriod);
              console.log('🔍 Movimientos filtrados:', filteredMovements.length);
              
              const chartDataResult = buildChartFromMovements(filteredMovements);
              console.log('📊 Datos para gráfica:', chartDataResult);
              
              setChartData(chartDataResult);
            } else {
              console.warn('⚠️ No se encontraron movimientos');
              setChartData([]);
            }

          } catch (err) {
            console.error('❌ Error al cargar movimientos:', err);
            setChartData([]);
          }
        } else {
          console.error('❌ No se pudo obtener el businessId');
          setChartData([]);
        }

      } catch (error) {
        console.error("❌ Error en Finance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [todayDate, chartPeriod, user]);

  // Cargar miembros del equipo (solo para propietarios)
  useEffect(() => {
    if (!isOwner) return;

    const loadTeamMembers = async () => {
      setLoadingTeam(true);
      try {
        const employees = await getEmployees();
        setTeamMembers(employees || []);
      } catch (error) {
        console.error("❌ Error al cargar miembros del equipo:", error);
      } finally {
        setLoadingTeam(false);
      }
    };

    loadTeamMembers();
  }, [isOwner]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        ⏳ Cargando Finanzas...
      </div>
    );
  }

  // ============================================
  // EXTRAER DATOS DEL SUMMARY
  // ============================================

  // Ingresos y Egresos del Día
  const totalTransactionsDay = summary?.totalTransactionsDay || {};
  const incomesToday = Number(totalTransactionsDay?.incomes || 0);
  const expensesToday = Number(totalTransactionsDay?.expenses || 0);

  // Ingresos y Egresos del Mes
  const totalTransactionsMonth = summary?.totalTransactionsMonth || {};
  const ingresosMonth = Number(totalTransactionsMonth?.incomes || 0);
  const egresosMonth = Number(totalTransactionsMonth?.expenses || 0);

  // Balance Mensual (desde el backend o calculado)
  const balanceMensual = summary?.monthBalance || (ingresosMonth - egresosMonth);

  // Meta Mensual
  const safeGoal = parseGoal(goal);
  const percentage = safeGoal > 0 ? Math.min((ingresosMonth / safeGoal) * 100, 100) : 0;

  const circleRadius = 40;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const progress = circleCircumference - (percentage / 100) * circleCircumference;

  const isOk = ingresosMonth >= egresosMonth;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-10 text-white">
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-8">
        <BarChart size={16} className="text-white/70" />
        <h1 className="text-lg font-semibold text-white/80">Finanzas</h1>
      </div>

      {/* GRID: Resumen + Meta + Alerta */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Panel Resumen - AHORA MUESTRA BALANCE MENSUAL */}
        <div className="flex flex-col md:flex-row justify-between lg:col-span-2 bg-[#0f172a] rounded-xl border border-white/10 p-6 shadow gap-6">
          <div>
            {/* Balance del Mes */}
            <h2 className={`text-4xl font-bold mb-1 ${
              balanceMensual >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {balanceMensual >= 0 
                ? `$${balanceMensual.toLocaleString()}` 
                : `-$${Math.abs(balanceMensual).toLocaleString()}`
              }
            </h2>
            <p className="text-xs text-white/70 mb-4">Balance del Mes</p>
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-green-400 text-sm font-semibold">
                  + ${ingresosMonth.toLocaleString()}
                </span>
                <span className="text-xs text-white/50">Ingresos del Mes</span>
              </div>
              <div className="flex flex-col">
                <span className="text-red-400 text-sm font-semibold">
                  - ${egresosMonth.toLocaleString()}
                </span>
                <span className="text-xs text-white/50">Egresos del Mes</span>
              </div>
            </div>
          </div>

          {/* Meta Mensual con gráfico circular */}
          <div className="flex items-center gap-4 md:gap-6">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r={circleRadius}
                  strokeWidth="6"
                  stroke="#1f2937"
                  fill="transparent"
                />
                <circle
                  cx="48"
                  cy="48"
                  r={circleRadius}
                  strokeWidth="6"
                  stroke="#8b5cf6"
                  fill="transparent"
                  strokeDasharray={circleCircumference}
                  strokeDashoffset={progress}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold">
                  {Math.round(percentage)}%
                </span>
                <span className="text-[10px] text-white/70">Completado</span>
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold mb-1">Meta Mensual</h3>
              <p className="text-2xl text-green-400 font-bold mb-1">
                ${safeGoal.toLocaleString()}
              </p>
              <p className="text-xs text-white/50 leading-snug mb-3">
                Llevas un total de {Math.round(percentage)}% completado
              </p>
              <button
                onClick={() => navigate("/dashboard/agregar-movimiento")}
                className="flex items-center justify-center gap-2 text-xs bg-white text-black px-4 py-1.5 rounded-full font-semibold shadow hover:opacity-90 transition"
              >
                Agregar Movimiento
              </button>
            </div>
          </div>
        </div>

        {/* Panel: Alerta */}
        <div
          className={`rounded-xl p-5 shadow border ${
            isOk ? "bg-[#14532d] border-green-800" : "bg-[#991b1b] border-red-800"
          }`}
        >
          <div className="flex items-center gap-2 mb-1 text-white">
            <AlertTriangle size={18} /> <span className="font-semibold">Shain</span>
          </div>
          <p className="text-sm">
            {isOk
              ? "Todo en orden: los ingresos superan (o igualan) los egresos."
              : "Alerta: Los egresos están superando los ingresos."}
          </p>
          <p className="text-xs text-white/80 mt-1">Reporte del mes actual</p>
          <p className="text-xs text-white/60">
            {isOk
              ? "Continúa con la estrategia actual"
              : "Se recomienda generar nuevos ingresos"}
          </p>
        </div>
      </div>

      {/* SECCIÓN: METAS DEL EQUIPO (Solo para propietarios) */}
      {isOwner && (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-6 mb-6 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Users size={20} className="text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Metas del Equipo</h3>
          </div>

          {loadingTeam ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-t-transparent border-purple-400 rounded-full"></div>
            </div>
          ) : teamMembers.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              No hay miembros registrados en el equipo.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.map((member) => {
                const memberIngresos = member.ingresos ?? 0;
                const memberGoal = member.goal ?? 0;
                const memberPercentage = memberGoal > 0 
                  ? Math.min((memberIngresos / memberGoal) * 100, 100) 
                  : 0;

                return (
                  <div
                    key={member._id || member.id}
                    className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-purple-500 transition-all cursor-pointer"
                    onClick={() => navigate(`/dashboard/employees/${member._id || member.id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-white font-semibold text-sm">
                          {member.name} {member.lastName}
                        </h4>
                        <p className="text-slate-400 text-xs capitalize">
                          {member.role || "Sin rol"}
                        </p>
                      </div>
                      <Target size={16} className="text-purple-400" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Meta personal:</span>
                        <span className="text-white font-semibold">
                          ${memberGoal.toLocaleString("es-CO")}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Ingresos:</span>
                        <span className="text-emerald-400 font-semibold">
                          ${memberIngresos.toLocaleString("es-CO")}
                        </span>
                      </div>

                      {/* Barra de progreso */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Progreso</span>
                          <span className="text-purple-400 font-semibold">
                            {Math.round(memberPercentage)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              memberPercentage >= 100
                                ? "bg-emerald-500"
                                : memberPercentage >= 75
                                ? "bg-green-500"
                                : memberPercentage >= 50
                                ? "bg-yellow-500"
                                : "bg-purple-500"
                            }`}
                            style={{ width: `${Math.min(memberPercentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* GRÁFICA */}
      <div className="bg-gradient-to-b from-[#0f172a] to-black rounded-xl border border-white/10 p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h3 className="text-sm font-semibold">
            Ingresos vs Egresos
          </h3>
          
          {/* Filtro de período */}
          <div className="flex gap-2">
            <button
              onClick={() => setChartPeriod("7days")}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                chartPeriod === "7days"
                  ? "bg-purple-600 text-white"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              7 días
            </button>
            <button
              onClick={() => setChartPeriod("month")}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                chartPeriod === "month"
                  ? "bg-purple-600 text-white"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              Mes actual
            </button>
            <button
              onClick={() => setChartPeriod("year")}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                chartPeriod === "year"
                  ? "bg-purple-600 text-white"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              Año
            </button>
            <button
              onClick={() => setChartPeriod("all")}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                chartPeriod === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              Histórico
            </button>
          </div>
        </div>

        <div className="bg-black/20 rounded-xl p-6">
          {chartData.length > 0 ? <Chart data={chartData} /> : (
            <p className="text-center text-white/60">📊 Sin datos disponibles para este período</p>
          )}
        </div>
      </div>

      {/* Mini Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mt-10">
        <MiniCardChart
          title="Ingresos Totales"
          value={`$${Number(ingresosMonth).toLocaleString()}`}
          percent={5}
          color="green"
          icon={<TrendingUp size={14} />}
          data={chartData.map((d) => ({ value: d.Ingresos }))}
        />
        <MiniCardChart
          title="Gastos Totales"
          value={`-$${Number(egresosMonth).toLocaleString()}`}
          percent={-15}
          color="red"
          icon={<TrendingDown size={14} />}
          data={chartData.map((d) => ({ value: d.Egresos }))}
        />
      </div>
    </div>
  );
};

export default Finance;