import { resolve } from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    testTimeout: 10000,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["packages/*/src/**/*.ts"],
      exclude: ["packages/*/src/**/*.d.ts"],
    },
    projects: [
      {
        test: {
          name: "mailpit-api",
          root: "packages/mailpit-api",
          include: ["tests/**/*.spec.ts"],
          environment: "node",
          testTimeout: 10000,
        },
      },
      {
        test: {
          name: "mailpit-ws",
          root: "packages/mailpit-ws",
          include: ["tests/**/*.spec.ts"],
          environment: "node",
          testTimeout: 10000,
        },
      },
      {
        resolve: {
          alias: {
            "mailpit-api": resolve(__dirname, "packages/mailpit-api/src/index.ts"),
            "mailpit-ws": resolve(__dirname, "packages/mailpit-ws/src/index.ts"),
          },
        },
        test: {
          name: "e2e",
          root: ".",
          include: ["tests/**/*.spec.ts"],
          environment: "node",
          testTimeout: 30000,
        },
      },
    ],
  },
});
