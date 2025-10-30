import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getEmployeeDetail } from "@services/employeeDetailService";

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [movements, setMovements] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Cargar los tres endpoints
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getEmployeeDetail(id);

        setEmployee(data.user);
        setMovements(data.movements || []);
        setSummary(data.summary || {});
      } catch (err) {
        console.error("❌ Error en EmployeeDetail:", err);
        setError(err.message || "No se pudo cargar la información del empleado.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleRetry = () => {
    setError("");
    setLoading(true);
    setTimeout(() => window.location.reload(), 400);
  };

  // Loader visual
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white">
        <div className="animate-spin h-10 w-10 border-4 border-t-transparent border-purple-400 rounded-full"></div>
        <p className="mt-3 text-white/80">Cargando información del empleado...</p>
      </div>
    );
  }

  // Error visual
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

  if (!employee) {
    return <p className="text-white text-center mt-10">Empleado no encontrado.</p>;
  }

  // Calcular totales (por si el backend no los trae)
  const totalIngresos =
    movements
      .filter((m) => m.type === "ingreso")
      .reduce((sum, m) => sum + Number(m.value || 0), 0) || 0;
  const totalEgresos =
    movements
      .filter((m) => m.type === "egreso")
      .reduce((sum, m) => sum + Number(m.value || 0), 0) || 0;

  return (
    <div className="p-6 min-h-screen bg-[#0b0b2f] text-white">
      <button
        onClick={() => navigate("/dashboard/employees")}
        className="flex items-center gap-2 text-indigo-400 mb-6 hover:text-indigo-300 transition"
      >
        <ArrowLeft size={18} /> Volver
      </button>

      <h1 className="text-3xl font-bold mb-2">{employee.name} {employee.lastName}</h1>
      <p className="text-white/80 mb-6 capitalize">{employee.role}</p>

      {/* --- Historial de movimientos --- */}
      <div className="bg-white rounded-xl p-5 shadow-sm mb-6 text-gray-800">
        <h2 className="font-semibold text-lg mb-3">Historial de movimientos</h2>

        {movements.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay movimientos registrados.</p>
        ) : (
          <div className="space-y-2">
            {movements.map((m) => (
              <div
                key={m._id || m.id}
                className="flex justify-between items-center border rounded-md p-3 text-sm"
              >
                <span>{m.description || m.desc || "Sin descripción"}</span>
                <span
                  className={
                    m.type === "ingreso"
                      ? "text-green-600 font-semibold"
                      : "text-red-600 font-semibold"
                  }
                >
                  {m.type === "ingreso" ? "+" : "-"}$
                  {Number(m.value || 0).toLocaleString("es-CO")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Resumen financiero --- */}
      <div className="bg-white rounded-xl p-5 shadow-sm text-gray-800">
        <h2 className="font-semibold text-lg mb-3">Balance total</h2>
        <div className="flex flex-col sm:flex-row justify-between text-sm gap-2">
          <p>
            <strong>Total de ingresos:</strong>{" "}
            <span className="text-green-600">
              ${totalIngresos.toLocaleString("es-CO")}
            </span>
          </p>
          <p>
            <strong>Total de egresos:</strong>{" "}
            <span className="text-red-600">
              ${totalEgresos.toLocaleString("es-CO")}
            </span>
          </p>
          <p>
            <strong>Balance mensual:</strong>{" "}
            <span
              className={
                (summary.monthBalance ?? totalIngresos - totalEgresos) >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              ${(
                summary.monthBalance ??
                totalIngresos - totalEgresos
              ).toLocaleString("es-CO")}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
