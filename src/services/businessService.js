import { axiosInstance } from '@services/axiosclient';

// Obtener la info del negocio por userId
export const getBusinessByUser = async (userId) => {
  try {
    const { data } = await axiosInstance.get(`/api/business/${userId}`);
    return data;
  } catch (error) {
    console.error("Error al obtener el negocio:", error);
    throw error;
  }
};

// Actualizar negocio por id
export const updateBusiness = async (id, payload) => {
  try {
    const { data } = await axiosInstance.patch(`/api/business/${id}`, payload);
    return data;
  } catch (error) {
    console.error("Error al actualizar el negocio:", error);
    throw error;
  }
};
