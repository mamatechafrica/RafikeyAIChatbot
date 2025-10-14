// eslint.config.js
import js from "@eslint/js";
import ts from "typescript-eslint";
import vue from "eslint-plugin-vue";
import prettier from "eslint-plugin-prettier";

export default [
  {
    // 🔕 Ignore non-source files
    ignores: [
      "node_modules",
      "dist",
      "dev-dist",
      "coverage",
      "public/assets",
      "sw.js",
      "*.config.js",
      "*.config.ts",
      "vite.config.*",
    ],
  },

  js.configs.recommended,
  ...ts.configs.recommended,
  ...vue.configs["flat/essential"],

{
  files: ["src/**/*.{ts,tsx,vue}"],
  languageOptions: {
    parser: vue.parser,
    parserOptions: {
      parser: ts.parser,
      ecmaVersion: "latest",
      sourceType: "module",
      extraFileExtensions: [".vue"],
    },
    globals: {
      window: "readonly",
      document: "readonly",
      navigator: "readonly",
      HTMLElement: "readonly",
      HTMLTextAreaElement: "readonly",
      HTMLDivElement: "readonly",
      DragEvent: "readonly",
      MouseEvent: "readonly",
      KeyboardEvent: "readonly", //
      setTimeout: "readonly",
      clearTimeout: "readonly",
      console: "readonly",
    },
  },
  plugins: { prettier },
  rules: {
    "vue/multi-word-component-names": "off",
    "vue/no-unused-components": "warn",
    "vue/no-mutating-props": "off",

    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-unused-expressions": "off",

    "no-console": "off",
    "no-debugger": "off",
    "no-unused-vars": "off",

    "prettier/prettier": ["warn"],
  },
},

];
