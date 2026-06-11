// Build the typed @core package down to js/programming.js — the exact module
// the live app imports. This is the strangler bridge: source of truth is
// src/core/*.ts; the browser keeps consuming a plain ESM file.
import { build } from "esbuild";

const banner =
  "// ⚠️ AUTO-GENERATED from src/core/*.ts — do not edit by hand.\n" +
  "// Regenerate with:  npm run build:core";

await build({
  entryPoints: ["src/core/index.ts"],
  outfile: "js/programming.js",
  bundle: true,
  format: "esm",
  target: "es2020",
  platform: "neutral",
  legalComments: "none",
  banner: { js: banner },
});

console.log("✓ built js/programming.js from src/core/*.ts");
