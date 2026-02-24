import esbuild from "esbuild"

esbuild.build({
  entryPoints: ["app.js"],
  bundle: true,
  minify: true,
  platform: "node",
  outfile: "dist/index.cjs",
  format: "cjs",
  define: {
    "import.meta.url": "__importMetaUrl",
  },
  banner: {
    js: 'const __importMetaUrl = require("url").pathToFileURL(__filename).href;',
  },
  sourcemap: true,
})
