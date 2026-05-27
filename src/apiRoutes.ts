const BASE_URL = import.meta.env.VITE_EGRESS_BE_URL ?? "http://localhost:8000";

const getEgress = (projectId: string) => {
  return `${BASE_URL}/egress/${projectId}`;
};

const downloadFile = (projectId: string, fileId: string) => {
  return `${BASE_URL}/egress/${projectId}/${fileId}`;
};

const approveFiles = (projectId: string) => {
  return `${BASE_URL}/egress/${projectId}`;
};

export { getEgress, downloadFile, approveFiles };
