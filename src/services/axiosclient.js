import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'https://shain.up.railway.app/api',
  withCredentials: true,
});
