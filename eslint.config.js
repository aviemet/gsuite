import { fixupPluginRules } from "@eslint/compat"
import json from "@eslint/json"
import stylistic from "@stylistic/eslint-plugin"
import tsParser from "@typescript-eslint/parser"
import importPlugin from "eslint-plugin-import"
import jsoncPlugin from "eslint-plugin-jsonc"
import jsxA11yPlugin from "eslint-plugin-jsx-a11y"
import reactHooksPlugin from "eslint-plugin-react-hooks"
import jsoncParser from "jsonc-eslint-parser"
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactRefresh from 'eslint-plugin-react-refresh';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import google from 'eslint-config-google';

const ignores = [
	"app/javascript/**/*",
	"app/frontend/types/serializers/**/*",
	"app/frontend/lib/routes/urlParams.ts",
	"app/frontend/lib/routes/routes.js",
	"app/frontend/lib/routes/routes.d.ts",
	"tmp/**/*",
	"public/**/*",
	".vscode/**/*",
	".yarn/**/*",
]

export default [
	js.configs.recommended,
	...tseslint.configs.recommended,
	...google.configs.recommended,
	{
		files: ['**/*.{js,jsx,ts,tsx}'],
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
				...globals.es2021
			},
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
				project: ['./tsconfig.json', './packages/*/tsconfig.json']
			}
		},
		plugins: {
			'@typescript-eslint': tseslint.plugin,
			'react-refresh': reactRefresh,
			'react-hooks': reactHooks,
			'jsx-a11y': jsxA11y,
			'import': importPlugin,
			'@stylistic': stylistic
		},
		rules: {
			...stylistic.configs['recommended-flat'].rules,
			'react-refresh/only-export-components': 'warn',
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',
			'import/order': ['error', {
				'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
				'newlines-between': 'always',
				'alphabetize': { order: 'asc' }
			}]
		},
		settings: {
			'import/resolver': {
				typescript: {
					project: ['./tsconfig.json', './packages/*/tsconfig.json']
				}
			}
		}
	},
	// Typescript declaration files
	{
		files: ["**/*.d.ts"],
		ignores,
		rules: {
			"no-unused-vars": "off",
			"@typescript-eslint/member-delimiter-style": "off",
			"@stylistic/ts/indent": "off",
		},
	},
	// Json files
	{
		files: ["**/*.json", "**/*.jsonc", "**/*.json5"],
		language: "json/json",
		ignores,
		plugins: {
			jsonc: jsoncPlugin,
			json,
		},
		languageOptions: {
			parser: jsoncParser,
		},
		rules: {
			"json/no-duplicate-keys": "error",
			"jsonc/indent": ["error", 2, { ignoredNodes: ["Property"] }],
			"@stylistic/no-multi-spaces": "off",
		},
	},
	// CSS-in-TS files
	{
		files: ["**/*.css.ts"],
		ignores,
		languageOptions: {
			parser: tsParser,
		},
		plugins: {
			"@stylistic": stylistic,
		},
		rules: {
			"@stylistic/template-curly-spacing": ["error", "always"],
			"no-restricted-syntax": [
				"error",
				{
					"selector": "TemplateLiteral > TemplateElement[value.raw=/\\${(?!vars\\.|theme\\.)/]",
					"message": "Use Mantine vars for styling variables",
				},
			],
			"import/order": ["error", {
				"groups": ["builtin", "external", ["parent", "sibling"], "internal", "index"],
				"pathGroups": [
					{ "pattern": "@linaria/core", "group": "external", "position": "before" },
					{ "pattern": "@mantine/**", "group": "external", "position": "after" },
					{ "pattern": "@/lib*", "group": "internal" },
				],
				"newlines-between": "always",
			}],
		},
	},
]
