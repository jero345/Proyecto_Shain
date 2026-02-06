import { axiosApi } from "@services/axiosclient";

// ✅ Servicio robusto con manejo de errores y estructura flexible
export const getEmployees = async () => {
  try {
    const response = await axiosApi.get("users/business", {
      withCredentials: true,
    });

    // Permitir ambas estructuras: { employees: [] } o { users: [] }
    const employees =
      response?.data?.employees || response?.data?.users || [];

    if (!Array.isArray(employees)) {
      return [];
    }

    return employees;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "No se pudo obtener la lista de empleados.";
    throw new Error(message);
  }
};
