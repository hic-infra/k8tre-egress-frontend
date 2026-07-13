import { NetworkError } from "./errors";
import type { EgressError } from "./interfaces/EgressError";
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

const auditTrailURL = (projectId: string) => {
  return `${BASE_URL}/egress/audit/${projectId}`;
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

async function parseErrorResponse(r: Response): Promise<never> {
  let errorMessage: string;
  try {
    const body: EgressError = await r.json();
    errorMessage = body.detail;
  } catch {
    errorMessage = await r.text();
  }
  throw new Error(`Request failed: ${errorMessage}`);
}

export async function handleEgressResponse<T>(r: Response): Promise<T> {
  if (r.ok) return r.json();
  return parseErrorResponse(r);
}

export { getEgressURL, downloadFileURL, approveFilesURL, auditTrailURL };
