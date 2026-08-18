import { axiosWithCreds, axiosWithoutCreds } from "./axiosInstances";

export const fetchUser = async () => {
  // skipAuthRedirect: a 401 here just means "not logged in yet", which
  // UserProvider/PrivateRoute already handle â€” it isn't a mid-session
  // expiry, so it shouldn't trigger the global redirect-to-login.
  const { data } = await axiosWithCreds.get("/user", { skipAuthRedirect: true });
  return data;
};


export const loginUser = async (formData) => {
  const { data } = await axiosWithCreds.post("/user/login", formData);
  return data;
};

export const registerUser = async (formData) => {
  const { data } = await axiosWithoutCreds.post("/user/register", formData);
  return data;
};


export const changePassword = async (payload) => {
  const { data } = await axiosWithCreds.patch("/user/change-password", payload);
  return data;
};


export const updateProfile = async (formData) => {
  const { data } = await axiosWithCreds.patch("/user/update-profile", formData);
  return data;
};


export const disableAccount = async () => {
  const { data } = await axiosWithCreds.patch("/user/soft-delete");
  return data;
};


export const deleteAccount = async () => {
  const { data } = await axiosWithCreds.delete("/user/hard-delete");
  return data;
};


export const logoutUser = async () => {
  const { data } = await axiosWithCreds.post("/user/logout");
  return data;
};

export async function bulkDeleteItems({
  fileIds,
  directoryIds,
}) {
  const { data } = await axiosWithCreds.post("/user/bulk-delete", {
    fileIds,
    directoryIds,
  });
  return data;
}

export const logoutAllSessions = async () => {
  const { data } = await axiosWithCreds.post("/user/logout-all");
  return data;
};