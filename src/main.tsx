import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import EgressPage from "./components/EgressPage.tsx";
import NotFound from "./components/NotFound.tsx";
import keycloakClient, { keycloakReady } from "./keycloak.ts";

keycloakReady.then(() => {
  if (!keycloakClient.authenticated) {
    keycloakClient.login();
    return;
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/egress/:id" element={<EgressPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </StrictMode>,
  );
});
