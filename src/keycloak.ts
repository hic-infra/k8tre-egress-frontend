import Keycloak from "keycloak-js";

const keycloakClient = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT,
});

export function requireAuth() {
  if (!keycloakClient.authenticated) {
    keycloakClient.login();
    // Throw to abort the loader — React Router will not render the route
    throw new Response("Redirecting to login", { status: 302 });
  }
}

export const keycloakReady = keycloakClient.init({
  onLoad: "login-required",
  pkceMethod: "S256",
  checkLoginIframe: false,
});

export default keycloakClient;
