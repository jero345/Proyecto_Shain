import { useState, useEffect } from "react";
import logo from "@assets/logo.png";
import { getBusinessByUser, updateBusiness } from "@services/businessService";

export const Settings = () => {
  const [business, setBusiness] = useState({
    id: "",
    name: "",
    goal: "",
    type: "",
  });

  const userId = "123"; // ⚡ reemplaza con el userId real (puedes sacarlo de contexto de auth)

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const data = await getBusinessByUser(userId);
        setBusiness({
          id: data.id,
          name: data.name,
          goal: data.goal,
          type: data.type,
        });
        localStorage.setItem("business", JSON.stringify(data)); // opcional: guardar cache
      } catch (error) {
        console.error("Error cargando negocio:", error);
      }
    };

    fetchBusiness();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBusiness((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveGoal = async () => {
    try {
      const updatedBusiness = { goal: business.goal };
      const response = await updateBusiness(business.id, updatedBusiness);
      setBusiness((prev) => ({ ...prev, goal: response.goal }));

      localStorage.setItem("business", JSON.stringify(response)); // actualizar cache
      alert("✅ Meta mensual actualizada correctamente");
    } catch (error) {
      alert("❌ Error al actualizar la meta mensual");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-10 text-white space-y-8">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm font-semibold text-white/70">
        ⚙️ <span>Configuración</span>
      </div>

      <h1 className="text-3xl font-bold">Información del negocio</h1>
      <p className="text-white/60 mb-4">
        Aquí puedes actualizar la información básica y tu meta mensual.
      </p>

      <div className="flex flex-col md:flex-row md:items-center gap-10">
        {/* Logo */}
        <div className="flex flex-col gap-4">
          <img
            src={logo}
            alt="Logo"
            className="w-44 h-44 object-contain bg-white rounded-md p-4"
          />
          <button className="text-sm underline text-white/80 hover:text-white">
            Actualizar logo
          </button>
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col gap-4">
          <div>
            <label className="block text-sm mb-1">Nombre del negocio*</label>
            <input
              type="text"
              name="name"
              value={business.name}
              disabled
              className="w-full px-4 py-2 rounded-md bg-[#0b0f19] border border-white/10 text-white"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Meta mensual*</label>
            <input
              type="number"
              name="goal"
              value={business.goal}
              onChange={handleChange}
              placeholder="Ej. 5000"
              className="w-full px-4 py-2 rounded-md bg-[#0b0f19] border border-white/10 text-white"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Tipo de negocio*</label>
            <input
              type="text"
              name="type"
              value={business.type}
              disabled
              className="w-full px-4 py-2 rounded-md bg-[#0b0f19] border border-white/10 text-white"
            />
          </div>

          <button
            onClick={handleSaveGoal}
            className="bg-[#ff5a00] hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-full mt-4 w-max"
          >
            Guardar Meta Mensual
          </button>
        </div>
      </div>
    </div>
  );
};
