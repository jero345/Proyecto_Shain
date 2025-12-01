import {
  ArrowUpRight, Plus, ScrollText, Home as HomeIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Chart } from "@components/Chart";
import { getDailySummaryService, getMovementsForServiceProvider, getMovementsForBusinessOwner } from "@services/addMovementService";

export const Home = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log('🏠 Iniciando carga del Home...');
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const userId = localStorage.getItem('user_id');
      const businessId = localStorage.getItem('business_id');

      console.log('👤 User ID:', userId);
      console.log('🏢 Business ID:', businessId);

      if (!userId && !businessId) {
        throw new Error('No se encontró el ID del usuario o negocio.');
      }

      // 1. Obtener el resumen del backend
      console.log('📊 Obteniendo resumen diario del backend...');
      const summaryData = await getDailySummaryService();
      console.log('✅ Resumen recibido:', summaryData);
      
      setSummary(summaryData);

      // 2. Obtener movimientos para el gráfico
      console.log('📈 Obteniendo movimientos para gráfico...');
      const movements = userId
        ? await getMovementsForServiceProvider(userId, '', 'month')
        : await getMovementsForBusinessOwner(businessId, '', 'month');

      console.log('✅ Movimientos recibidos:', movements?.length || 0);

      if (movements?.length) {
        const chart = buildChartFromMovements(movements);
        console.log('📊 Datos procesados para gráfico:', chart);
        setChartData(chart);
      } else {
        setChartData([]);
      }

    } catch (err) {
      console.error("❌ Error en fetchData:", err);
      setError(err.message || "No se pudo cargar la información del dashboard");
    } finally {
      setLoading(false);
    }
  };

  const buildChartFromMovements = (movements) => {
    if (!movements || !Array.isArray(movements)) return [];

    const grouped = {};
    
    movements.forEach((m) => {
      if (!m.date || !m.type || m.value == null) return;
      
      // Formato de fecha sin desfase
      const [year, month, day] = m.date.split('-').map(Number);
      const fecha = new Date(year, month - 1, day);
      const dateKey = fecha.toLocaleDateString("es-CO", {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = { date: dateKey, Ingresos: 0, Egresos: 0 };
      }
      
      const val = Number(m.value) || 0;
      const type = (m.type || '').toLowerCase();
      
      if (type === "ingreso") {
        grouped[dateKey].Ingresos += val;
      } else if (type === "egreso") {
        grouped[dateKey].Egresos += val;
      }
    });

    // Ordenar por fecha
    return Object.values(grouped).sort((a, b) => {
      const [dayA, monthA, yearA] = a.date.split('/').map(Number);
      const [dayB, monthB, yearB] = b.date.split('/').map(Number);
      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);
      return dateA - dateB;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#a32063] via-[#4b1d69] to-[#0b0b2f]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#a32063] via-[#4b1d69] to-[#0b0b2f]">
        <div className="text-center">
          <p className="text-red-400 text-xl font-semibold mb-4">❌ {error}</p>
          <button
            onClick={fetchData}
            className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg transition text-white"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // EXTRAER DATOS DEL SUMMARY (Nueva estructura)
  // ============================================

  // Estadísticas del día
  const dayStatistics = summary?.dayStatistics || {};
  const totalTransactionsDay = dayStatistics?.totalTransactionsDay || {};
  
  const incomesToday = Number(totalTransactionsDay?.incomes || 0);
  const expensesToday = Number(totalTransactionsDay?.expenses || 0);
  const totalDelDia = incomesToday - expensesToday;

  const salesIncreaseAmountDay = Number(dayStatistics?.salesIncreaseAmountDay || 0);
  const salesGrowthPercentageDay = Number(dayStatistics?.salesGrowthPercentageDay || 0);

  // Estadísticas del mes
  const monthStatistics = summary?.monthStatistics || {};
  const totalTransactionsMonth = monthStatistics?.totalTransactionsMonth || {};
  
  const ingresosMonth = Number(totalTransactionsMonth?.incomes || 0);
  const egresosMonth = Number(totalTransactionsMonth?.expenses || 0);
  const monthBalance = Number(monthStatistics?.monthBalance || 0);

  // Margen de ganancia (desde el nivel principal)
  const profitMargin = Number(summary?.profitMargin || 0);

  console.log('📊 Datos extraídos del summary:', {
    totalDelDia,
    incomesToday,
    expensesToday,
    ingresosMonth,
    egresosMonth,
    monthBalance,
    salesGrowthPercentageDay,
    profitMargin
  });

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#a32063] via-[#4b1d69] to-[#0b0b2f] text-white px-4 py-10">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 text-sm text-white font-semibold mb-1">
          <HomeIcon size={16} className="text-white/80" /> Inicio
        </div>
        <h1 className="text-5xl font-extrabold mb-8">Resumen</h1>

        {/* Tarjetas principales */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {/* Total del día */}
          <div className="flex items-center justify-between bg-[#421953]/80 p-6 rounded-xl border border-purple-700 shadow-md">
            <div>
              <p className="text-sm text-white/80 mb-1">Total del día</p>
              <h2 className={`text-4xl font-extrabold ${
                totalDelDia >= 0 ? 'text-green-300' : 'text-red-300'
              }`}>
                {totalDelDia >= 0 
                  ? `+$${totalDelDia.toLocaleString()}` 
                  : `-$${Math.abs(totalDelDia).toLocaleString()}`
                }
              </h2>
              <div className="mt-3 text-xs text-white/70 space-y-1">
                <p className="flex items-center gap-1">
                  <span className="text-green-400">↑</span>
                  Ingresos: ${incomesToday.toLocaleString()}
                </p>
                <p className="flex items-center gap-1">
                  <span className="text-red-400">↓</span>
                  Egresos: ${expensesToday.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex flex-col text-right ml-4">
              <div className={`flex items-center justify-end gap-1 text-sm mb-1 ${
                salesGrowthPercentageDay >= 0 ? 'text-green-300' : 'text-red-300'
              }`}>
                <ArrowUpRight size={16} className={salesGrowthPercentageDay < 0 ? 'rotate-90' : ''} />
                {Math.abs(salesGrowthPercentageDay).toFixed(1)}% respecto ayer
              </div>
              <p className={`text-sm ${
                salesIncreaseAmountDay >= 0 ? 'text-green-300' : 'text-red-300'
              }`}>
                {salesIncreaseAmountDay >= 0 ? 'Incremento' : 'Disminución'} de ${Math.abs(salesIncreaseAmountDay).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Totales del mes */}
          <div className="bg-black/20 p-6 rounded-xl border border-white/10 flex flex-col justify-between">
            <div>
              <p className="text-white/80 font-bold mb-1">Ingresos del mes</p>
              <p className="text-3xl font-bold text-green-300 mb-4">
                +${ingresosMonth.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-white/80 font-bold mb-1">Egresos del mes</p>
              <p className="text-3xl font-bold text-red-300 mb-4">
                -${egresosMonth.toLocaleString()}
              </p>
            </div>
            <div className="border-t border-white/20 pt-4 mt-2">
              <p className="text-white/70 text-sm mb-1">Balance del mes</p>
              <p className={`text-2xl font-bold ${
                monthBalance >= 0 ? 'text-green-300' : 'text-red-300'
              }`}>
                {monthBalance >= 0 ? '+' : '-'}${Math.abs(monthBalance).toLocaleString()}
              </p>
            </div>
            {profitMargin > 0 && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-white/70 text-xs mb-1">Margen de ganancia</p>
                <p className="text-lg font-bold text-purple-300">
                  ${profitMargin.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Botones de acciones */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button 
            onClick={() => navigate("/dashboard/agregar-movimiento")}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:opacity-90 text-white px-6 py-3 rounded-full text-sm font-semibold transition shadow-lg hover:shadow-xl"
          >
            <Plus size={18} /> Agregar Movimiento
          </button>
          <button 
            onClick={() => navigate("/dashboard/historial")}
            className="flex items-center justify-center gap-2 border border-white/30 hover:bg-white/10 px-6 py-3 rounded-full text-sm font-semibold transition"
          >
            <ScrollText size={18} /> Ver Historial Financiero
          </button>
        </div>

        {/* Gráfico */}
        <div className="mt-10">
          <h3 className="text-xl font-bold mb-4">📊 Movimientos del Mes Actual</h3>
          <div className="bg-black/20 rounded-xl p-6 border border-white/10">
            {chartData.length > 0 ? (
              <Chart data={chartData} />
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4 opacity-50">📈</div>
                <p className="text-white/60 text-lg font-medium">Sin datos disponibles</p>
                <p className="text-white/40 text-sm mt-2">Agrega movimientos para visualizar el gráfico</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};