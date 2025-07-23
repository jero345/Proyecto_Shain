import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'https://5qz4wrdx-4000.use2.devtunnels.ms/api',
  withCredentials: true,
});
