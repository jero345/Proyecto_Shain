import { axiosInstance } from '@services/axiosclient';

export const loginRequest = async (credentials) => {
  try {
    const res = await axiosInstance.post('/auth/login', credentials, {
      withCredentials: true,
    });

    // backend debe enviar el token o ya setear cookie HttpOnly
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
    }

    return {
      status: res.data.status,
      data: res.data.data,
      token: res.data.token || null,
    };
  } catch (error) {
    if (error.response) throw error;
    throw new Error('Error de conexión con el servidor');
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
