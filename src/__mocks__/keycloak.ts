import { vi } from "vitest";

const keycloakClient = {
  token: "mock-token",
  authenticated: true,
  updateToken: vi.fn().mockResolvedValue(true),
  login: vi.fn(),
  logout: vi.fn(),
};

export const keycloakReady = Promise.resolve(true);
export default keycloakClient;
