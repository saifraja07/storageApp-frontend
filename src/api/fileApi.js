import { axiosWithCreds } from "./axiosInstances";

export const deleteFile = async (fileId) => {
  const { data } = await axiosWithCreds.delete(`/files/${fileId}`);
  return data;
};

export const renameFile = async (fileId, newFilename) => {
  const { data } = await axiosWithCreds.patch(`/files/${fileId}`, {
    newFilename,
  });
  return data;
};

export const uploadInitiate = async (metaData) => {
  const { data } = await axiosWithCreds.post("/files/uploads/initiate", metaData);
  return data;
};

// The backend's :uploadId is the fileId returned by uploadInitiate.
export const uploadComplete = async ({ fileId }) => {
  const { data } = await axiosWithCreds.post(
    `/files/uploads/${fileId}/complete`,
  );
  return data;
};

export const uploadCancel = async ({ fileId }) => {
  const { data } = await axiosWithCreds.post(
    `/files/uploads/${fileId}/cancel`,
  );
  return data;
};
