import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/globals.css";
import "./tree.css";

const root = document.getElementById("root")!;

// Prerendered routes already have markup in #root → hydrate it.
// Plain SPA loads (empty #root) → mount fresh.
if (root.hasChildNodes()) {
  hydrateRoot(root, <App />);
} else {
  createRoot(root).render(<App />);
}
