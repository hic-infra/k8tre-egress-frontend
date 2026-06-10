import keycloakClient from "./keycloak";

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

async function getFreshToken(): Promise<string> {
  await keycloakClient.updateToken(30);
  return keycloakClient.token!;
}

export async function authorizedFetch(
  input: RequestInfo,
  init: RequestInit = {},
): Promise<Response> {
  const token = await getFreshToken();

  return fetch(input, {
    ...init,
    headers: {
      ...init.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

export { getEgress, downloadFile, approveFiles };
