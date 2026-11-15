import { defineConfig, lazyPlugins } from "vite-plus";
import { devtools } from "@tanstack/devtools-vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

const config = defineConfig({
  fmt: {},
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  resolve: { tsconfigPaths: true },
  plugins: lazyPlugins(() => [
    devtools(),
    nitro({
      rollupConfig: { external: [/^@sentry\//] },
      devProxy: {
        "/api": {
          target: "http://localhost:8080",
          changeOrigin: true,
        },
      },
      routeRules: {
        "/api/**": {
          proxy: "http://localhost:8080/api/**",
        },
      },
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ]),
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});

export default config;
