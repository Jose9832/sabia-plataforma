import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import { useApp } from "./state/store";
import "./styles/index.css";

/* Service Worker (PWA): guarda la app para abrirla sin internet */
registerSW({ immediate: true });

/* Recupera sesión y cola offline, y empieza a escuchar los cambios de red */
useApp.getState().iniciar();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
