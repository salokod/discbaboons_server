import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
    },
    ignores: ["coverage/**", "node_modules/**"],
    rules: { "no-unused-vars": ["error", { varsIgnorePattern: "^(nothingHere|isAdmin|dateCreated)$" }] },
  },
  pluginJs.configs.recommended,
];
