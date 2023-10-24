import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import mkcert from "vite-plugin-mkcert";

// https://vitejs.dev/config/
export default defineConfig({
  base: "https://tudiman555.github.io/webRTC-chat-app/",
  plugins: [react(), nodePolyfills(), mkcert()],
  define: {
    global: {},
  },
});
