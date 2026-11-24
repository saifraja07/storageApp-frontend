import { axiosWithCreds } from "./axiosInstances";

export const getDirectoryItems = async (
  dirId = "",
  { page, limit, search, sortBy, sortDir } = {},
) => {
  const endpoint = dirId ? `/directories/${dirId}` : "/directories";
  const params = { page, limit };
  if (search) params.search = search;
  if (sortBy) {
    params.sortBy = sortBy;
    params.sortDir = sortDir;
  }
  const { data } = await axiosWithCreds.get(endpoint, { params });
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
