import { axiosWithCreds } from "./axiosInstances";

export const getDirectoryItems = async (dirId = "") => {
  const endpoint = dirId ? `/directories/${dirId}` : "/directories";
  const { data } = await axiosWithCreds.get(endpoint);
  return data;
};

export async function getDirectoryPath(directoryId) {
  const { data } = await axiosWithCreds.get(
    `/directories/${directoryId}/path`,
  );
  return data;
}

export const createDirectory = async (parentDirId = "", newDirname) => {
  const endpoint = parentDirId
    ? `/directories/${parentDirId}/children`
    : "/directories";

  const { data } = await axiosWithCreds.post(endpoint, {
    dirname: newDirname,
  });
  return data;
};

export const deleteDirectory = async (directoryId) => {
  const { data } = await axiosWithCreds.delete(`/directories/${directoryId}`);
  return data;
};

export const renameDirectory = async (directoryId, newDirName) => {
  const { data } = await axiosWithCreds.patch(
    `/directories/${directoryId}`,
    { newDirName },
  );
  return data;
};
