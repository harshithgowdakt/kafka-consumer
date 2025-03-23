import { defineConfig, globalIgnores } from "eslint/config";
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import typescriptEslintEslintPlugin from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([globalIgnores(["**/.eslintrc.js", "**/node_modules", "**/dist"]), {
    extends: fixupConfigRules(compat.extends(
        "plugin:@typescript-eslint/recommended",
        "plugin:prettier/recommended",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/typescript",
    )),

    plugins: {
        "@typescript-eslint": fixupPluginRules(typescriptEslintEslintPlugin),
    },

    languageOptions: {
        globals: {
            ...globals.node,
            ...globals.jest,
        },

        parser: tsParser,
        ecmaVersion: 5,
        sourceType: "module",

        parserOptions: {
            project: "tsconfig.json",
            tsconfigRootDir: "/Users/harshithgowda/Code/kafka-consumer",
        },
    },

    rules: {
        "@typescript-eslint/interface-name-prefix": "off",
        "@typescript-eslint/explicit-function-return-type": "error",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "prettier/prettier": "error",

        "@typescript-eslint/no-unused-vars": ["error", {
            vars: "all",
            args: "after-used",
            ignoreRestSiblings: true,
            varsIgnorePattern: "^_",
        }],

        "@typescript-eslint/naming-convention":
            ["error",
                {
                    selector: "variable",
                    format: ["strictCamelCase", "StrictPascalCase"],
                    leadingUnderscore: "allow",
                }, {
                    selector: "enum",
                    format: ["StrictPascalCase"],
                }, {
                    selector: "enumMember",
                    format: ["UPPER_CASE"],
                }, {
                    selector: "typeLike",
                    format: ["StrictPascalCase"],
                }, {
                    selector: "class",
                    format: ["StrictPascalCase"],
                    leadingUnderscore: "allow",
                }],

        "prefer-const": "error",
        "no-trailing-spaces": "error",
        "linebreak-style": ["error", "unix"],

        "max-len": ["warn", {
            code: 120,
            ignoreTemplateLiterals: true,
            ignoreUrls: true,
            ignoreStrings: true,
        }],

        "@typescript-eslint/no-floating-promises": "error",
        "@typescript-eslint/consistent-type-assertions": "error",
        "consistent-return": "error",
        "no-console": "warn",
        "no-shadow": "error",
        "prefer-arrow-callback": "error",
        "no-eval": "error",

        "import/order": ["error", {
            groups: ["builtin", "external", "internal", ["parent", "sibling", "index"]],
            "newlines-between": "always",

            alphabetize: {
                order: "asc",
                caseInsensitive: true,
            },
        }],
    },
    "settings": {
        "import/extensions": [".js", ".jsx", ".ts", ".tsx"],
        "import/parsers": {
            "@typescript-eslint/parser": [".ts", ".tsx"]
        },
        "import/resolver": {
            "node": {
                "extensions": [".js", ".jsx", ".ts", ".tsx"],
                "moduleDirectory": ["node_modules", "src/"]
            }
        }
    },
}, {
    files: ["src/**/*"],
    rules: {},
}]);