import { axiosWithCreds, axiosWithoutCreds } from "./axiosInstances";

// Authentication
export const loginUser = async (formData) => {
  const { data } = await axiosWithCreds.post("/auth/login", formData);
  return data;
};

export const registerUser = async (formData) => {
  const { data } = await axiosWithoutCreds.post("/auth/register", formData);
  return data;
};

export const sendOtp = async (email) => {
  const { data } = await axiosWithoutCreds.post("/auth/otp/send", { email });
  return data;
};

export const verifyOtp = async (email, otp) => {
  const { data } = await axiosWithoutCreds.post("/auth/otp/verify", {
    email,
    otp,
  });
  return data;
};

export const loginWithGoogle = async (code) => {
  const { data } = await axiosWithCreds.post("/auth/google", { code });
  return data;
};

export const logoutUser = async () => {
  const { data } = await axiosWithCreds.post("/auth/logout");
  return data;
};

export const logoutAllSessions = async () => {
  const { data } = await axiosWithCreds.post("/auth/logout-all");
  return data;
};

// Credential management
export const changePassword = async (payload) => {
  const { data } = await axiosWithCreds.patch("/users/me/password", payload);
  return data;
};
