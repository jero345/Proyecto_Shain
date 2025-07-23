import { axiosInstance } from '@services/axiosclient';

export const loginRequest = async (credentials) => {
  const res = await axiosInstance.post('/auth/login', credentials, { withCredentials: true });
  console.log (res.data);
  return res.data;
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