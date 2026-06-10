import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import keycloakClient from "./keycloak";
import { CircularProgress } from "@mui/material";

export default function Root() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    keycloakClient
      .init({
        onLoad: "check-sso",
        silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
        pkceMethod: "S256",
      })
      .then(() => setReady(true));
  }, []);

  if (!ready) return <CircularProgress aria-label="Loading…" />;

  return <Outlet />;
}
