import { axiosWithCreds } from "./axiosInstances";

export const fetchUser = async () => {
  // A 401 here means "not logged in yet"; UserProvider/PrivateRoute handle it.
  const { data } = await axiosWithCreds.get("/users/me", {
    skipAuthRedirect: true,
  });
  return data;
};

export const updateProfile = async (formData) => {
  const { data } = await axiosWithCreds.patch("/users/me/profile", formData);
  return data;
};

export const disableAccount = async () => {
  const { data } = await axiosWithCreds.patch("/users/me/deactivation");
  return data;
};

export const deleteAccount = async () => {
  const { data } = await axiosWithCreds.delete("/users/me");
  return data;
};

export async function bulkDeleteItems({ fileIds, directoryIds }) {
  const { data } = await axiosWithCreds.post("/users/me/bulk-delete", {
    fileIds,
    directoryIds,
  });
  return data;
}
