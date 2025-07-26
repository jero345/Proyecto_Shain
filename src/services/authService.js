import { axiosInstance } from '@services/axiosclient';

export const loginRequest = async (credentials) => {
  try {
    const res = await axiosInstance.post('/auth/login', credentials, {
      withCredentials: true, // ✅ importante para enviar/recibir cookies
    });

    console.log("📥 Respuesta del backend:");
    console.log("✅ Status:", res.status);
    console.log("✅ Headers:", res.headers);
    console.log("✅ Datos:", res.data);

    return res.data;
  } catch (error) {
    console.error("❌ Error al hacer login:");
    if (error.response) {
      // Error con respuesta del servidor
      console.error("⛔ Status:", error.response.status);
      console.error("⛔ Data:", error.response.data);
    } else {
      // Error sin respuesta (por ejemplo, red caída)
      console.error("⛔ Error general:", error.message);
    }
    throw error;
  }
};


export const registerRequest = async (form) => {
  const res = await axiosInstance.post('/auth/register', form);
  return res.data;
};

export const userProfile  = async (form) => {
  const res = await axiosInstance.get('/user', form);
  return res.data;
};

export const getUserByIdService = async (id) => {
  const res = await axiosInstance.get(`/users/${id}`, { withCredentials: true });
  return res.data.data;
};

export const updateUserService = async (id, payload) => {
  const res = await axiosInstance.patch(`/users/${id}`, payload, { withCredentials: true });
  return res.data.data;
};

export const changePasswordService = async (userId, data) => {
  const res = await axiosInstance.patch(`/users/${userId}/change-password`, data, {
    withCredentials: true,
  });
  return res.data;
};
