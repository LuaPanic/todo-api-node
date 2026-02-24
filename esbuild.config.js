import esbuild from "esbuild"

esbuild.build({
  entryPoints: ["app.js"],
  bundle: true,
  minify: true,
  platform: "node",
  outfile: "dist/index.cjs",
  sourcemap: true,
})
