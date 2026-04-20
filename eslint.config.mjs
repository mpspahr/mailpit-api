import eslint from "@eslint/js";
import vitest from "@vitest/eslint-plugin";
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  {
    plugins: {
      vitest,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
  {
    files: ["packages/*/tests/**/*.spec.ts", "tests/**/*.spec.ts"],
    plugins: { vitest },
    rules: {
      ...vitest.configs.recommended.rules,
      "@typescript-eslint/unbound-method": "off",
      // expect.any() / expect.objectContaining() etc. return `any` by design
      "@typescript-eslint/no-unsafe-assignment": "off",
    },
  },
);
