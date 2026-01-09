import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AlertTriangle, BarChart, Target, Users, CheckCircle } from "lucide-react";
import { Chart } from "@components/Chart";
import { MiniCardChart } from "@components/MiniCardChart";
import { getDailySummaryService } from "@services/addMovementService";
import { getEmployees } from "@services/employeesService";
import { getBusinessById } from "@services/businessService";
import { useAuth } from "@context/AuthContext";
import { TrendingUp, TrendingDown } from "lucide-react";
import { ROLES, normalizeRole } from "../constant/roles";

export const Finance = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth() || {};
  const userRole = normalizeRole(user?.role || "");

  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [goal, setGoal] = useState(0);
  const [businessData, setBusinessData] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [chartPeriod, setChartPeriod] = useState("7days");

  const todayDate = new Date().toISOString().split("T")[0];
  const isOwner = userRole === ROLES.OWNER;

  console.log('🎯 Finance - Rol del usuario:', userRole, 'isOwner:', isOwner);

  const parseGoal = (v) => {
    if (v == null) return 0;
    const n = Number(String(v).replace(/[^\d.]/g, ""));
    return Number.isFinite(n) ? n : 0;
  };

  // Obtener userId y businessId de forma robusta
  const getUserId = () => {
    let userId = localStorage.getItem('user_id');
    if (!userId) {
      userId = user?.id || user?._id || user?.userId;
      if (userId) {
        localStorage.setItem('user_id', userId);
      }
    }
    return userId;
  };

  const getBusinessId = () => {
    let businessId = localStorage.getItem('business_id');
    if (!businessId) {
      const businessValue = user?.business || user?.businessId;
      if (typeof businessValue === 'string') {
        businessId = businessValue;
        localStorage.setItem('business_id', businessId);
      } else if (businessValue && typeof businessValue === 'object') {
        businessId = businessValue.id || businessValue._id;
        if (businessId) {
          localStorage.setItem('business_id', businessId);
        }
      }
    }
    return businessId;
  };

  // Convertir movimientos para la gráfica
  const buildChartFromMovements = (movements) => {
    const grouped = {};
    (Array.isArray(movements) ? movements : []).forEach((m) => {
      if (!m.date) return;
      
      const [year, month, day] = m.date.split('-').map(Number);
      const fecha = new Date(year, month - 1, day);
      const dateKey = fecha.toLocaleDateString("es-CO", {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      if (!grouped[dateKey]) grouped[dateKey] = { date: dateKey, Ingresos: 0, Egresos: 0 };
      const t = (m.type || "").toLowerCase();
      
      if (t === "ingreso") grouped[dateKey].Ingresos += Number(m.value) || 0;
      if (t === "egreso") grouped[dateKey].Egresos += Number(m.value) || 0;
    });

    return Object.values(grouped).sort((a, b) => {
      const [dayA, monthA, yearA] = a.date.split('/').map(Number);
      const [dayB, monthB, yearB] = b.date.split('/').map(Number);
      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);
      return dateA - dateB;
    });
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

  // ============================================
  // CARGAR DATOS DEL NEGOCIO (SOLO para propietarios)
  // ============================================
  useEffect(() => {
    if (!isOwner) {
      console.log('👤 Usuario es prestador, saltando carga de business');
      return;
    }

    const loadBusinessData = async () => {
      // Primero intentar desde cache
      const cached = localStorage.getItem("business");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          console.log('💾 Business desde cache:', parsed);
          setBusinessData(parsed);
          if (parsed?.goal != null) {
            setGoal(parseGoal(parsed.goal));
          }
          return;
        } catch (e) {
          console.warn('⚠️ Error parseando business desde cache:', e);
        }
      }

      // Si no hay cache, cargar desde el servidor
      const businessId = getBusinessId();
      
      if (!businessId) {
        console.warn('⚠️ No hay businessId disponible');
        return;
      }

      console.log('🔄 Cargando business desde servidor...', businessId);
      
      try {
        const data = await getBusinessById(businessId);
        console.log('✅ Business desde servidor:', data);
        
        setBusinessData(data);
        localStorage.setItem('business', JSON.stringify(data));
        
        if (data?.goal != null) {
          setGoal(parseGoal(data.goal));
        }
      } catch (err) {
        console.error('❌ Error cargando business:', err);
      }
    };

    loadBusinessData();
  }, [user, isOwner]);

  // Escuchar cambios en localStorage
  useEffect(() => {
    if (!isOwner) return;

    const onStorage = (e) => {
      if (e.key === "business" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          console.log('🔄 Business actualizado desde storage event:', parsed);
          setBusinessData(parsed);
          if (parsed?.goal != null) {
            setGoal(parseGoal(parsed.goal));
          }
        } catch (error) {
          console.error('❌ Error al parsear los datos del negocio', error);
        }
      }
    };
    
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [isOwner]);

  // ============================================
  // CARGAR RESUMEN Y MOVIMIENTOS
  // ============================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const userId = getUserId();
        const businessId = getBusinessId();

        console.log('📊 Finance - IDs disponibles:', { userId, businessId, role: userRole, isOwner });

        // Validación: necesitamos userId para prestadores, businessId para propietarios
        if (isOwner && !businessId) {
          throw new Error('No se encontró el ID de negocio. Por favor, cierra sesión y vuelve a iniciar.');
        }
        
        if (!isOwner && !userId) {
          throw new Error('No se encontró tu ID de usuario. Por favor, cierra sesión y vuelve a iniciar.');
        }

        // 1. Obtener resumen (funciona para ambos roles)
        console.log('📊 Obteniendo resumen diario del backend...');
        
        try {
          const summaryData = await getDailySummaryService();
          console.log('✅ Resumen recibido:', summaryData);
          
          if (summaryData) {
            setSummary(summaryData);
            localStorage.setItem("financeSummary", JSON.stringify(summaryData));
          }
        } catch (summaryError) {
          console.error('❌ Error obteniendo resumen:', summaryError);
          // Si es 401, dejar que el interceptor lo maneje
          if (summaryError?.response?.status !== 401) {
            // Solo mostrar error si NO es 401
            console.warn('⚠️ Continuando sin resumen...');
          }
        }

        // 2. Obtener movimientos según rol
        console.log('📈 Obteniendo movimientos para gráfico...');

        try {
          let allMovements = [];

          if (isOwner && businessId) {
            console.log('🏢 Cargando movimientos del NEGOCIO COMPLETO...');
            
            const { getBusinessFinanceSummary } = await import("@services/financeService");
            
            console.log('📞 Llamando a getBusinessFinanceSummary con businessId:', businessId);
            
            const [ingresosData, egresosData] = await Promise.all([
              getBusinessFinanceSummary(businessId, 'ingreso'),
              getBusinessFinanceSummary(businessId, 'egreso')
            ]);

            console.log('💰 INGRESOS recibidos:', ingresosData?.length || 0);
            console.log('💸 EGRESOS recibidos:', egresosData?.length || 0);

            allMovements = [
              ...(Array.isArray(ingresosData) ? ingresosData.map(m => ({ ...m, type: 'ingreso' })) : []),
              ...(Array.isArray(egresosData) ? egresosData.map(m => ({ ...m, type: 'egreso' })) : [])
            ];
          } else if (!isOwner && userId) {
            console.log('👤 Cargando movimientos del USUARIO (prestador)...');
            
            const { getUserFinanceSummary } = await import("@services/financeService");
            
            console.log('📞 Llamando a getUserFinanceSummary con userId:', userId);
            
            const movementsData = await getUserFinanceSummary(userId);

            console.log('📦 Movimientos de usuario recibidos:', movementsData?.length || 0);
            allMovements = Array.isArray(movementsData) ? movementsData : [];
          }

          console.log('📦 Total movimientos obtenidos:', allMovements.length);

          if (allMovements.length > 0) {
            const filteredMovements = filterMovementsByPeriod(allMovements, chartPeriod);
            console.log('🔍 Movimientos filtrados por período:', filteredMovements.length);
            
            const chartDataResult = buildChartFromMovements(filteredMovements);
            console.log('📊 Datos procesados para gráfico:', chartDataResult.length, 'puntos');
            
            setChartData(chartDataResult);
          } else {
            console.log('⚠️ No hay movimientos disponibles');
            setChartData([]);
          }
        } catch (movementsError) {
          console.error('❌ Error obteniendo movimientos:', movementsError);
          // Si es 401, dejar que el interceptor lo maneje
          if (movementsError?.response?.status !== 401) {
            setChartData([]);
          }
        }

      } catch (err) {
        console.error("❌ Error en Finance:", err);
        setError(err.message || "Error al cargar información financiera");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [todayDate, chartPeriod, user, isOwner]);

  // Cargar miembros del equipo (solo para propietarios)
  useEffect(() => {
    if (!isOwner) {
      console.log('👤 Usuario no es propietario, saltando carga de equipo');
      return;
    }

    const loadTeamMembers = async () => {
      setLoadingTeam(true);
      try {
        const employeesData = await getEmployees();
        
        const { axiosApi } = await import("@services/axiosclient");
        
        const employeesWithData = await Promise.all(
          (employeesData || []).map(async (emp) => {
            try {
              console.log(`🔍 Obteniendo movimientos para ${emp.name} (ID: ${emp._id || emp.id})`);
              
              const movementsRes = await axiosApi.get(
                `movements/user/${emp._id || emp.id}`,
                { withCredentials: true }
              );
              const movements = movementsRes?.data?.data || movementsRes?.data || [];
              
              const now = new Date();
              const currentMonth = now.getMonth();
              const currentYear = now.getFullYear();
              
              const ingresosDelMes = movements
                .filter((m) => {
                  const movementDate = new Date(m.date);
                  return (
                    m.type === "ingreso" &&
                    movementDate.getMonth() === currentMonth &&
                    movementDate.getFullYear() === currentYear
                  );
                })
                .reduce((sum, m) => sum + Number(m.value || 0), 0);
              
              return { 
                ...emp, 
                movements,
                ingresosDelMes
              };
            } catch (err) {
              console.error(`❌ Error obteniendo datos para ${emp.name}:`, err);
              return { 
                ...emp, 
                movements: [],
                ingresosDelMes: 0
              };
            }
          })
        );
        
        setTeamMembers(employeesWithData);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#0f172a]">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-purple-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-pink-500 animate-spin" style={{ animationDuration: '1.5s' }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <BarChart className="w-8 h-8 text-purple-400 animate-pulse" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Cargando Finanzas
          </h2>
          <p className="text-white/60 text-sm">Preparando tu información financiera...</p>
          
          <div className="flex justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Si hay error y no hay datos
  if (error && !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#0f172a]">
        <div className="text-center">
          <div className="bg-gradient-to-br from-red-900/40 to-red-950/60 border-2 border-red-500/30 rounded-2xl p-8 max-w-md">
            <p className="text-red-400 text-xl font-semibold mb-4">❌ {error}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-xl transition-all text-white font-semibold shadow-lg hover:scale-105"
              >
                Reintentar
              </button>
              <button
                onClick={logout}
                className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl transition-all text-white font-semibold"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Estadísticas (con valores por defecto si no hay summary)
  const dayStatistics = summary?.dayStatistics || {};
  const totalTransactionsDay = dayStatistics?.totalTransactionsDay || {};
  
  const incomesToday = Number(totalTransactionsDay?.incomes || 0);
  const expensesToday = Number(totalTransactionsDay?.expenses || 0);

  const monthStatistics = summary?.monthStatistics || {};
  const totalTransactionsMonth = monthStatistics?.totalTransactionsMonth || {};
  
  const ingresosMonth = Number(totalTransactionsMonth?.incomes || 0);
  const egresosMonth = Number(totalTransactionsMonth?.expenses || 0);

  const yearStatistics = summary?.yearStatistics || {};
  const totalTransactionsYear = yearStatistics?.totalTransactionsYear || {};
  
  const ingresosYear = Number(totalTransactionsYear?.incomes || 0);
  const egresosYear = Number(totalTransactionsYear?.expenses || 0);

  const profitMargin = Number(summary?.profitMargin || 0);
  const balanceYear = ingresosYear - egresosYear;

  const balanceMensual = Number(monthStatistics?.monthBalance || 0);

  const safeGoal = parseGoal(goal);
  const percentage = safeGoal > 0 ? Math.min((ingresosMonth / safeGoal) * 100, 100) : 0;

  const circleRadius = 40;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const progress = circleCircumference - (percentage / 100) * circleCircumference;

  const isOk = ingresosMonth >= egresosMonth;

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-10 text-white">
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-6 sm:mb-8">
        <BarChart size={16} className="text-white/70" />
        <h1 className="text-lg font-semibold text-white/80">Finanzas</h1>
      </div>

      {/* GRID: Resumen + Meta + Alerta */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        {/* Panel Resumen */}
        <div className="xl:col-span-2 bg-[#0f172a] rounded-xl border border-white/10 p-4 sm:p-6 shadow">
          {/* Balance del Mes */}
          <div className="mb-6">
            <h2 className={`text-3xl sm:text-4xl font-bold mb-1 ${
              balanceMensual >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {balanceMensual >= 0 
                ? `$${balanceMensual.toLocaleString()}` 
                : `-$${Math.abs(balanceMensual).toLocaleString()}`
              }
            </h2>
            <p className="text-xs text-white/70 mb-4">Balance del Mes</p>
            
            {/* Ingresos y Egresos */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
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

          {/* Separador */}
          <div className="border-t border-white/10 my-4"></div>

          {/* Meta Mensual */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="38%"
                  strokeWidth="6"
                  stroke="#1f2937"
                  fill="transparent"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="38%"
                  strokeWidth="6"
                  stroke={percentage >= 100 ? "#10b981" : "#8b5cf6"}
                  fill="transparent"
                  strokeDasharray={circleCircumference}
                  strokeDashoffset={progress}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-base sm:text-lg font-bold ${percentage >= 100 ? 'text-emerald-400' : ''}`}>
                  {Math.round(percentage)}%
                </span>
              </span>
            </div>

            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h3 className="text-xs font-semibold text-white/70 mb-1">Meta Mensual</h3>
              <p className="text-xl sm:text-2xl text-green-400 font-bold mb-1">
                ${safeGoal.toLocaleString()}
              </p>
              <p className="text-xs text-white/50 mb-3">
                Llevas {Math.round(percentage)}% de tu meta
              </p>
              <button
                onClick={() => navigate("/dashboard/agregar-movimiento")}
                className="inline-flex items-center justify-center gap-1.5 text-xs bg-white text-black px-4 py-2 rounded-full font-semibold shadow hover:opacity-90 transition"
              >
                + Agregar Movimiento
              </button>
            </div>
          </div>
        </div>

        {/* Panel: Alerta */}
        <div
          className={`rounded-xl p-4 sm:p-6 shadow-lg border transition-all ${
            isOk 
              ? "bg-gradient-to-br from-emerald-900/40 to-emerald-950/60 border-emerald-700/50" 
              : "bg-gradient-to-br from-red-900/40 to-red-950/60 border-red-700/50"
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            {isOk ? (
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle size={20} className="text-emerald-400" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
            )}
            <span className="font-bold text-lg text-white">Shain</span>
          </div>
          
          <h4 className={`text-base font-semibold mb-2 ${
            isOk ? "text-emerald-300" : "text-red-300"
          }`}>
            {isOk ? "✓ Todo en orden" : "⚠ Alerta financiera"}
          </h4>
          
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed mb-3">
            {isOk ? (
              <>
                Los ingresos superan los egresos.
                <br />
                ¡Excelente gestión!
              </>
            ) : (
              <>
                Los egresos están superando
                <br />
                los ingresos este mes.
              </>
            )}
          </p>
          
          <div className={`mt-4 pt-4 border-t ${
            isOk ? "border-emerald-700/30" : "border-red-700/30"
          }`}>
            <p className="text-xs text-white/70 font-medium mb-1">Reporte del mes actual</p>
            <p className={`text-xs font-semibold ${
              isOk ? "text-emerald-400" : "text-red-400"
            }`}>
              {isOk
                ? "→ Continúa con la estrategia actual"
                : "→ Se recomienda generar nuevos ingresos"}
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN: METAS DEL EQUIPO (Solo para propietarios) */}
      {isOwner && (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-4 sm:p-6 mb-6 shadow-md">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.map((member) => {
                const memberIngresos = member.ingresosDelMes ?? 0;
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
                        <span className={`font-semibold ${memberPercentage >= 100 ? 'text-emerald-400' : 'text-emerald-400'}`}>
                          ${memberIngresos.toLocaleString("es-CO")}
                        </span>
                      </div>

                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Progreso</span>
                          <span className={`font-semibold ${memberPercentage >= 100 ? 'text-emerald-400' : 'text-purple-400'}`}>
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
      <div className="bg-gradient-to-b from-[#0f172a] to-black rounded-xl border border-white/10 p-4 sm:p-6 mb-6">
        <div className="flex flex-col gap-4 mb-4">
          <h3 className="text-sm font-semibold">
            Ingresos vs Egresos
          </h3>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setChartPeriod("7days")}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                chartPeriod === "7days"
                  ? "bg-purple-600 text-white"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              Semana actual
            </button>
            <button
              onClick={() => setChartPeriod("month")}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                chartPeriod === "month"
                  ? "bg-purple-600 text-white"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              Mes
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

        <div className="bg-black/20 rounded-xl p-3 sm:p-6">
          {chartData.length > 0 ? <Chart data={chartData} /> : (
            <p className="text-center text-white/60 py-8">Sin datos disponibles para este período</p>
          )}
        </div>
      </div>

      {/* Mini Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 sm:mt-10">
        <MiniCardChart
          title="Ingresos Totales del Año"
          value={`$${Number(ingresosYear).toLocaleString("es-CO")}`}
          color="green"
          icon={<TrendingUp size={14} />}
          data={chartData.map((d) => ({ value: d.Ingresos }))}
        />
        <MiniCardChart
          title="Gastos Totales del Año"
          value={`$${Number(egresosYear).toLocaleString("es-CO")}`}
          color="red"
          icon={<TrendingDown size={14} />}
          data={chartData.map((d) => ({ value: d.Egresos }))}
        />
        <MiniCardChart
          title="Margen de Beneficio"
          value={`$${Math.abs(balanceYear).toLocaleString("es-CO")}`}
          color="blue"
          icon={balanceYear >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          data={chartData.map((d) => ({ value: d.Ingresos - d.Egresos }))}
        />
      </div>
    </div>
  );
};

export default Finance;