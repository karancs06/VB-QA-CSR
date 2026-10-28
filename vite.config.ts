import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";

// https://vitejs.dev/config/
export default defineConfig(() => {
  const isHttps = process.env.HTTPS === "true";

  return {
    plugins: [react(), isHttps && basicSsl()].filter(Boolean),
    server: {
      port: isHttps ? 3007 : 3006,
      open: true,
    },
    build: {
      outDir: "build",
    },
  };
});
