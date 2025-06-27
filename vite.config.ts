import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Make environment variables available to the frontend
    __API_URL__: mode === 'production' 
      ? JSON.stringify('https://xsmmarket.com/api')
      : JSON.stringify('http://localhost:5000/api'),
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: mode !== 'production',
  },
}));
