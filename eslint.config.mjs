import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Config Next.js standard
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // 🔽 OVERRIDE SPÉCIFIQUE POUR LES ROUTES API APP ROUTER
  {
    files: ["app/api/**/route.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-implicit-any": "off",
    },
  },
];

export default eslintConfig;
