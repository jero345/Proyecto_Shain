// src/services/timeslotsService.js
import { axiosInstance } from '@services/axiosclient';

export const createTimeslotsService = async (payload) => {
  // payload ejemplo:
  // {
  //   date: "2025-08-20",
  //   startTime: "09:00",
  //   endTime: "17:00",
  //   slotMinutes: 30,
  //   capacity: 1
  // }
  const { data } = await axiosInstance.post("/timeslots/", payload, {
    withCredentials: true,
  });
  return data;
};
