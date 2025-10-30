import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEmployees } from "@services/employeesService";

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
        if (!data.length) setError("No hay empleados registrados actualmente.");
        setEmployees(data);
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
            const ingresos = emp.ingresos ?? 0;
            const egresos = emp.egresos ?? 0;
            const balance = ingresos - egresos;

            return (
              <div
                key={emp._id || emp.id || index}
                onClick={() =>
                  navigate(`/dashboard/employees/${emp._id || emp.id}`)
                }
                className="cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 p-5"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {emp.name || "Sin nombre"} {emp.lastName || ""}
                    </h2>
                    <p className="text-sm text-gray-500 capitalize">
                      {emp.role || "Sin rol"}
                    </p>
                  </div>
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md font-medium">
                    {emp.businessCode }
                  </span>
                </div>

                <div className="text-sm text-gray-700 space-y-1 mb-4">
                  <p>
                    <strong>Correo:</strong>{" "}
                    {emp.email || "Sin correo registrado"}
                  </p>
                  <p>
                    <strong>Ingresos:</strong>{" "}
                    <span className="text-green-600 font-semibold">
                      ${ingresos.toLocaleString("es-CO")}
                    </span>
                  </p>
                  <p>
                    <strong>Egresos:</strong>{" "}
                    <span className="text-red-600 font-semibold">
                      ${egresos.toLocaleString("es-CO")}
                    </span>
                  </p>
                </div>

                <div
                  className={`rounded-lg p-3 text-center font-semibold ${
                    balance >= 0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  Balance: ${balance.toLocaleString("es-CO")}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
