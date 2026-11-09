import { axiosWithCreds } from "./axiosInstances";

export const fetchAllUsers = async () => {
  const { data } = await axiosWithCreds.get("/admin/users");
  return data;
};

export const fetchPlansDashboard = async () => {
  const { data } = await axiosWithCreds.get("/admin/dashboard/plans");
  return data;
};

export const logoutUserByAdmin = async (userId) => {
  const { data } = await axiosWithCreds.post(
    `/admin/users/${userId}/sessions/revoke`,
  );
  return data;
};

export const softDeleteUserByAdmin = async (userId) => {
  const { data } = await axiosWithCreds.patch(
    `/admin/users/${userId}/status`,
    { isDeleted: true },
  );
  return data;
};

export const hardDeleteUserByAdmin = async (userId) => {
  const { data } = await axiosWithCreds.delete(`/admin/users/${userId}`);
  return data;
};

export const recoverUserByAdmin = async (userId) => {
  const { data } = await axiosWithCreds.patch(
    `/admin/users/${userId}/status`,
    { isDeleted: false },
  );
  return data;
};

export const updateUserRoleByAdmin = async (userId, role) => {
  const { data } = await axiosWithCreds.patch(
    `/admin/users/${userId}/role`,
    { role },
  );
  return data;
};

export const fetchR2Usage = async () => {
  const { data } = await axiosWithCreds.get("/admin/dashboard/storage/usage");
  return data;
};

export const refreshR2Usage = async () => {
  const { data } = await axiosWithCreds.post(
    "/admin/dashboard/storage/usage/refresh",
  );
  return data;
};
