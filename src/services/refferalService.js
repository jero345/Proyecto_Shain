// src/services/referralService.js
import { axiosApi } from "@services/axiosclient";

// PATCH /users/:id/referral-code { referralCode }
export const updateReferralCodeService = async (userId, referralCode) => {
  const payload = { referralCode: (referralCode || "").trim() };
  const res = await axiosApi.patch(
    `/users/${userId}/referral-code`,
    payload,
    { withCredentials: true }
  );
  return res.data?.data ?? res.data;
};

// GET /users/referred-code?code=...  -> usuarios que usaron ese código
export const getUsersByReferredCodeService = async (code, page = 1, limit = 1000) => {
  if (!code) return [];
  const res = await axiosApi.get("/users/referred-code", {
    params: { code, page, limit },
    withCredentials: true,
  });
  return res.data?.data ?? res.data?.users ?? [];
};

// GET /users/referral-code -> usuarios que tienen (o no) código; paginado
export const getUsersWithReferralCodeService = async (page = 1, limit = 10) => {
  const res = await axiosApi.get("/users/referral-code", {
    params: { page, limit },
    withCredentials: true,
  });
  return {
    data: res.data?.data ?? res.data?.users ?? [],
    totalPages: res.data?.totalPages ?? res.data?.pagination?.totalPages ?? 1,
    page: res.data?.page ?? page,
  };
};
