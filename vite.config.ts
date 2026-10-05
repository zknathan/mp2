import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { COLLECTION_IDS } from "./src/data/collection.ts";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "github-pages-routes",
      // GitHub Pages has no SPA rewrite rules. Give every supported clean route
      // its own entry HTML so pasted detail URLs and refreshes return HTTP 200.
      async closeBundle() {
        const html = await readFile(resolve("dist/index.html"), "utf8");
        for (const route of [
          "list",
          "about",
          ...COLLECTION_IDS.map((id) => `artworks/${id}`),
        ]) {
          const directory = resolve("dist", route);
          await mkdir(directory, { recursive: true });
          await writeFile(resolve(directory, "index.html"), html);
        }
        await writeFile(resolve("dist/404.html"), html);
      },
    },
  ],
  base: "/mp2/",
});
