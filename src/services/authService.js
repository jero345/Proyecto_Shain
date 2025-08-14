import { axiosInstance } from '@services/axiosclient';

export const loginRequest = async (credentials) => {
  try {
    console.groupCollapsed('[auth] loginRequest');
    console.log('→ POST /auth/login');
    console.log('payload (sanitized):', { email: credentials?.email });

    const res = await axiosInstance.post('/auth/login', credentials, {
      withCredentials: true,
    });

    console.log('← status:', res.status);
    console.log('response.data:', res.data);

    // backend debe enviar el token o ya setear cookie HttpOnly
    if (res.data?.token) {
      localStorage.setItem('token', res.data.token);
      console.log('token guardado en localStorage');
    } else {
      console.log('sin token en payload (posible cookie HttpOnly)');
    }

    console.groupEnd();

    return {
      status: res.data?.status,
      data: res.data?.data,
      token: res.data?.token || null,
    };
  } catch (error) {
    console.groupCollapsed('[auth] loginRequest ERROR');
    console.error('status:', error?.response?.status);
    console.error('data:', error?.response?.data || error?.message);
    console.groupEnd();

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

export const forgotPasswordService = async (email) => {
  try {
    const res = await axiosInstance.post('/auth/forgot-password', { email }, {
      withCredentials: true,
    });

    console.log('✅ Link de recuperación enviado:', res.data);
    return res.data;
  } catch (error) {
    console.error('❌ Error al enviar email de recuperación:', error);
    throw error;
  }
};

export const resetPasswordService = async ({ token, password }) => {
  // Si tu backend espera otro nombre de campo (p.ej. newPassword), cámbialo aquí.
  const { data } = await axiosInstance.post('/auth/reset-password', {
    token,
    password,
  });
  return data; // { success, message, ... } según tu API
};