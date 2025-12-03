import js from "@eslint/js"
import globals from "globals"
import { FlatCompat } from "@eslint/eslintrc"
import pluginPrettier from "eslint-plugin-prettier"

const __dirname = process.cwd() // Required in the flat config
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
})

export default [
  // Base recommended JS config
  js.configs.recommended,

  // Next.js recommended configs using compat
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Prettier config
  {
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      "prettier/prettier": "error",
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
  },

  // Ignore patterns
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
]
