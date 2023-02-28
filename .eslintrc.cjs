module.exports = {
  env: {
    node: true,
    jest: true,
    es2021: true,
  },
  globals: { logger: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "eslint:recommended",
    // "plugin:@cspell/recommended",
    "plugin:sonarjs/recommended",
  ],
  overrides: [],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: [
    "@typescript-eslint",
    "sonarjs",
    // "security",
    // "@cspell",
  ],
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        args: "after-used",
        argsIgnorePattern: "^_",
        ignoreRestSiblings: true,
        vars: "all",
      },
    ],
    "arrow-parens": "warn",
    indent: ["error", 2],
    "linebreak-style": ["error", "unix"],
    "no-delete-var": "warn",
    "no-unused-vars": [
      "warn",
      {
        args: "after-used",
        argsIgnorePattern: "^_",
        ignoreRestSiblings: true,
        vars: "all",
      },
    ],
    "no-use-before-define": [
      "error",
      {
        allowNamedExports: false,
        classes: true,
        functions: false,
        variables: false,
      },
    ],
    "no-var": "warn",
    "object-shorthand": ["error", "always"],
    quotes: ["warn", "double"],
    semi: ["error", "always"],
    // "@cspell/spellchecker": [
    //   "warn",
    //   {
    //     ignoreImportProperties: false,
    //     ignoreImports: false,
    //   },
    // ],
    // "no-restricted-globals": ["error"].concat(restrictedGlobals),
    // "no-unused-expressions": 0,
  },
};

//   "node/exports-style": ["error", "module.exports"],
//   "node/file-extension-in-import": ["error", "always"],
//   "node/prefer-global/buffer": ["error", "always"],
//   "node/prefer-global/console": ["error", "always"],
//   "node/prefer-global/process": ["error", "always"],
//   "node/prefer-global/url-search-params": ["error", "always"],
//   "node/prefer-global/url": ["error", "always"],
//   "node/prefer-promises/dns": "error",
//   "node/prefer-promises/fs": "error"
