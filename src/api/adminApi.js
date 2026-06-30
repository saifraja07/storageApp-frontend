import { axiosWithCreds } from "./axiosInstances";


export const fetchAllUsers = async () => {
  const { data } = await axiosWithCreds.get("/admin/users");
  return data;
};

export const fetchPlansDashboard = async () => {
  const { data } = await axiosWithCreds.get("/admin/plans-overview");
  return data;
};

export const logoutUserByAdmin = async (id) => {
  const { data } = await axiosWithCreds.post(`/admin/users/${id}/logout`);
  return data;
};


export const softDeleteUserByAdmin = async (id) => {
  const { data } = await axiosWithCreds.patch(
    `/admin/users/${id}/soft`
  );
  return data;
};

export const hardDeleteUserByAdmin = async (id) => {
  const { data } = await axiosWithCreds.delete(
    `/admin/users/${id}/hard`
  );
  return data;
};

export const recoverUserByAdmin = async (id) => {
  const { data } = await axiosWithCreds.patch(
    `/admin/users/${id}/recover`
  );
  return data;
};

export const updateUserRoleByAdmin = async (id, role) => {
  const { data } = await axiosWithCreds.patch(
    `/admin/users/${id}/role`,
    { role }
  );
  return data;
};