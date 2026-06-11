// Build the Preact UI components down to js/ui-components.js — the ESM module
// ui.js imports and mounts (strangler migration of the screens). Preact is
// bundled in; esbuild transpiles the JSX with zero extra compiler.
import { build } from "esbuild";

const banner =
  "// ⚠️ AUTO-GENERATED from src/ui/*.tsx — do not edit by hand.\n" +
  "// Regenerate with:  npm run build:ui";

await build({
  entryPoints: ["src/ui/index.ts"],
  outfile: "js/ui-components.js",
  bundle: true,
  format: "esm",
  target: "es2020",
  platform: "browser",
  jsx: "automatic",
  jsxImportSource: "preact",
  legalComments: "none",
  banner: { js: banner },
});

console.log("✓ built js/ui-components.js from src/ui/*.tsx");
