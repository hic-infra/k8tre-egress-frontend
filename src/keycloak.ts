import Keycloak from "keycloak-js";

const keycloakClient = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL,        // e.g. "https://auth.example.com"
  realm: import.meta.env.VITE_KEYCLOAK_REALM,    // e.g. "myrealm"
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT, // e.g. "my-react-app"
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
