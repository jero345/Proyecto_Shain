// src/services/businessService.js
import { axiosInstance } from '@services/axiosclient';

// Si tu axiosInstance.baseURL ya incluye /api, deja '/business'.
// Si no, usa '/api/business'.
const BASE = '/business';

const pick = (res) => res?.data?.data ?? res?.data ?? res;
const toStr = (v) => (v === null || v === undefined ? '' : String(v));

/** GET business/{userId} */
export const getBusinessByUser = async (userId) => {
  const res = await axiosInstance.get(`${BASE}/${userId}`, { withCredentials: true });
  const raw = pick(res);
  return {
    id: raw?._id ?? raw?.id ?? '',
    user: toStr(raw?.user),
    name: toStr(raw?.name),
    goal: toStr(raw?.goal),
    type: toStr(raw?.type),
    description: toStr(raw?.description),
    image: toStr(raw?.image),
    createdAt: raw?.createdAt,
    updatedAt: raw?.updatedAt,
  };
};

/** PATCH business/{id} — FormData con todos los campos (strings) + image opcional */
export const saveBusinessFD = async (id, { name, goal, type, description, imageFile }) => {
  const fd = new FormData();
  fd.append('name', toStr(name));
  fd.append('goal', toStr(goal));
  fd.append('type', toStr(type));
  fd.append('description', toStr(description));
  if (imageFile) fd.append('image', imageFile); // opcional

  const res = await axiosInstance.patch(`${BASE}/${id}`, fd, {
    withCredentials: true,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const raw = pick(res);
  return {
    id: raw?._id ?? raw?.id ?? '',
    user: toStr(raw?.user),
    name: toStr(raw?.name),
    goal: toStr(raw?.goal),
    type: toStr(raw?.type),
    description: toStr(raw?.description),
    image: toStr(raw?.image),
    createdAt: raw?.createdAt,
    updatedAt: raw?.updatedAt,
  };
};
