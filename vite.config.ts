import { defineConfig } from "vite"
import voby from "voby-vite"

export default defineConfig({
  plugins: [voby()],
  esbuild: {
    supported: {
      "top-level-await": true,
    },
  },
})
