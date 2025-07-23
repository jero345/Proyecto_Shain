// src/services/addMovementService.js
import { axiosInstance } from '@services/axiosclient';

export const addMovementService = async (movement) => {
  const res = await axiosInstance.post('/movements', movement, { withCredentials: true });
  return res.data;
};


export const getMovementsService = async (type = '') => {
  const url = type && type !== 'todos' ? `/movements?type=${type}` : '/movements';
  const res = await axiosInstance.get(url, { withCredentials: true });
  return res.data.data;
};

export const updateMovementService = async (id, data) =>
  axiosInstance.patch(`/movements/${id}`, data, { withCredentials: true });

export const deleteMovementService = async (id) =>
  axiosInstance.delete(`/movements/${id}`, { withCredentials: true });