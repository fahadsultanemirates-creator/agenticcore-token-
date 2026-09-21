import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Deno Edge Functions -- a separate runtime/toolchain from the Next.js
    // app (Deno's own `deno lint` covers these, not this project's ESLint).
    "supabase/functions/**",
    // Hardhat project -- its own toolchain and generated typechain output,
    // not part of the Next.js app.
    "contracts/**",
  ]),
]);

export default eslintConfig;
