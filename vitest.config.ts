import { defineConfig } from "vitest/config";

// @core unit tests live in src/. The node-run scripts in test/ (which exercise
// the *built* js/programming.js and boot the real ui.js) are run separately via
// `npm run test:artifact` / `test:integration`, not by vitest.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
});
