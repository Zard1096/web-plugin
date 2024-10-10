import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
// const { createRoutesFromFolders } = require("@remix-run/v1-route-convention");

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
      // routes(defineRoutes) {
      //   // uses the v1 convention, works in v1.15+ and v2
      //   return createRoutesFromFolders(defineRoutes);
      // },
    }),
    tsconfigPaths(),
  ],
});
