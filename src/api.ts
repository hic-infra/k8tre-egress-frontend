import { NetworkError } from "./errors";
import keycloakClient from "./keycloak";

const BASE_URL = import.meta.env.VITE_EGRESS_BE_URL ?? "http://localhost:8000";

const getEgressURL = (projectId: string) => {
  return `${BASE_URL}/egress/${projectId}`;
};

const downloadFileURL = (projectId: string, fileId: string) => {
  return `${BASE_URL}/egress/${projectId}/${fileId}`;
};

const approveFilesURL = (projectId: string) => {
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
  try {
    return await fetch(input, {
      ...init,
      headers: {
        ...init.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  } catch {
    throw new NetworkError();
  }
}

export { getEgressURL, downloadFileURL, approveFilesURL };
