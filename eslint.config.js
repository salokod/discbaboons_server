import globals from "globals";
import pluginJs from "@eslint/js";
import airbnbBase from "eslint-config-airbnb-base";

export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.commonjs,
        ...globals.es2021,
        ...globals.jest,
        ...globals.node, // Add Node.js globals
      },
      ecmaVersion: 'latest',
    },
    rules: {
      ...airbnbBase.rules, // Merge Airbnb base rules
      'max-len': 0,
      'import/extensions': 0,
    },
  },
  pluginJs.configs.recommended,
];