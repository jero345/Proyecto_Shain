import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'https://api.shain.finance/api',
  withCredentials: true,
});
