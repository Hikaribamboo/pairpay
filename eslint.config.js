// eslint.config.js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import * as parser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  js.configs.recommended,

  // TypeScript の基本設定（.ts/.tsx 対象）
  ...tseslint.config({
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser,
      parserOptions: {
        sourceType: "module",
        project: "./tsconfig.json",
      },
    },
    rules: {
      // TypeScript では core の no-undef は無効化（型空間を誤検知するため）
      "no-undef": "off",
    },
  }),

  // React（.tsx 対象）
  {
    files: ["**/*.tsx"],
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": "warn",
    },
  },

  // ✅ クライアント（ブラウザ）側：/app 配下ただし /app/api を除外
  {
    files: [
      "src/app/**/*.{ts,tsx}",
      "!src/app/api/**",
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        // 念のため明示
        fetch: "readonly",
        console: "readonly",
      },
    },
  },

  // ✅ サーバ（Node）側：API ルートや server-only ライブラリ
  {
    files: [
      "src/app/api/**/*.{ts,tsx}",
      "src/lib/**/*server*.ts",
      "src/lib/firebase-server.ts",
      "src/lib/services/**/*.ts",
      "src/**/*.server.ts",
    ],
    languageOptions: {
      globals: {
        ...globals.node,
        // Next.js のランタイムでも使えるが、ESLint に教えるため明示
        fetch: "readonly",
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
      },
    },
  },

  // 共有ライブラリ等で fetch を使う場合の保険
  {
    files: ["src/lib/**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        fetch: "readonly",
        console: "readonly",
      },
    },
  },
];
