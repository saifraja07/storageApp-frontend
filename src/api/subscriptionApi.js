import { axiosWithCreds } from "./axiosInstances";

export const getActiveSubscription = async () => {
  const { data } = await axiosWithCreds.get("/subscriptions/active");
  return data;
};

export const createSubscription = async (planId) => {
  const { data } = await axiosWithCreds.post("/subscriptions", { planId });
  return data;
};

export const verifySubscription = async (payload) => {
  const { data } = await axiosWithCreds.post("/subscriptions/verify", payload);
  return data;
};

export const cancelSubscription = async (subscriptionId) => {
  const { data } = await axiosWithCreds.post(
    `/subscriptions/${subscriptionId}/cancel`,
  );
  return data;
};

export const getUpdatePaymentLink = async (subscriptionId) => {
  const { data } = await axiosWithCreds.get(
    `/subscriptions/${subscriptionId}/payment-method/update-link`,
  );
  return data;
};

export const getPaymentHistory = async (subscriptionId) => {
  const { data } = await axiosWithCreds.get(
    `/subscriptions/${subscriptionId}/payments`,
  );
  return data;
};
