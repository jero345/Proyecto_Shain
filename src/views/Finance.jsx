export function Finance() {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gradientStart via-gradientMid2 to-gradientEnd">
      <div className="w-full max-w-7xl mx-auto px-4 py-6">
        <div className="mb-4">
          <h2 className="text-3xl font-bold text-white">Finanzas</h2>
          <p className="text-sm text-gray-200">Control diario y metas mensuales</p>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          <button className="w-full bg-orange-600 text-white px-4 py-3 rounded-lg">+ Agregar Movimiento</button>
          <button className="w-full bg-purple-800 text-white px-4 py-3 rounded-lg border border-white">📄 Ver Historial Financiero</button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-black/30 p-6 rounded-xl text-white">
            {/* Card Resumen del día */}
          </div>
          <div className="bg-red-800/90 p-6 rounded-xl text-white">
            {/* Card Alerta financiera */}
          </div>
        </div>
      </div>
    </div>
  );
}
