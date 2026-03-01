import baseConfig from "@loretto/eslint-config/next.mjs";

export default [
  ...baseConfig,
  {
    ignores: ["next-env.d.ts", ".next/"],
  },
];
