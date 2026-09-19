import { fixupConfigRules } from "@eslint/compat"
import stylistic from "@stylistic/eslint-plugin"
import * as tsParser from "@typescript-eslint/parser"
import importPlugin from "eslint-plugin-import"
import jsoncPlugin from "eslint-plugin-jsonc"
import jsxA11yPlugin from "eslint-plugin-jsx-a11y"
import reactHooksPlugin from "eslint-plugin-react-hooks"

const ignores = [
	".vscode/**/*",
	".yarn/**/*",
]

const importLintGlobs = ["**/*.{js,jsx,mjs,cjs,ts,tsx}"]

export default [
	{
		ignores,
	},
	{
		files: ["**/*.mjs"],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: "latest",
				sourceType: "module",
			},
		},
		settings: {
			"import/resolver": {
				typescript: {
					project: "./tsconfig.json",
				},
			},
		},
	},
	...fixupConfigRules([
		importPlugin.flatConfigs.recommended,
		importPlugin.flatConfigs.typescript,
	]).map((config) => ({
		...config,
		files: importLintGlobs,
	})),
	// Typescript/Javascript files
	{
		...stylistic.configs.customize({
			indent: "tab",
		}),

		files: ["**/*.{js,jsx,ts,tsx}"],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			parser: tsParser,
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
		settings: {
			"react": {
				version: "detect",
			},
			"import/resolver": {
				typescript: {
					project: "./tsconfig.json",
				},
			},
			"jsx-a11y": {
				polymorphicPropName: "component",
			},
		},
		plugins: {
			"react-hooks": reactHooksPlugin,
			"jsx-a11y": jsxA11yPlugin,
			"@stylistic": stylistic,
		},
		rules: {
			"@stylistic/indent": ["error", "tab", {
				SwitchCase: 1,
				VariableDeclarator: "first",
				MemberExpression: 1,
				ArrayExpression: 1,
				ignoredNodes: [
					"TSTypeParameterInstantiation",
					"TemplateLiteral",
					"TemplateElement",
					"JSXExpressionContainer > TemplateLiteral",
					"JSXExpressionContainer > TemplateElement",
				],
			}],
			"@stylistic/brace-style": ["error", "1tbs", {
				allowSingleLine: true,
			}],
			"@stylistic/object-curly-spacing": ["error", "always", {
				objectsInObjects: true,
			}],
			"@stylistic/jsx-curly-spacing": ["error", {
				when: "always",
				children: true,
			}],
			"@stylistic/member-delimiter-style": ["error", {
				multiline: {
					delimiter: "none",
				},
				singleline: {
					delimiter: "comma",
				},
				multilineDetection: "brackets",
			}],
			"@stylistic/jsx-one-expression-per-line": "off",
			"@stylistic/keyword-spacing": ["error", {
				after: true,
				before: true,
				overrides: {
					if: { after: false },
					for: { after: false },
					while: { after: false },
					switch: { after: false },
					catch: { after: false },
				},
			}],
			"@stylistic/comma-dangle": ["error", {
				arrays: "always-multiline",
				objects: "always-multiline",
				imports: "always-multiline",
				exports: "always-multiline",
				functions: "only-multiline",
			}],
			"@stylistic/multiline-ternary": ["error", "always-multiline"],
			"@stylistic/space-before-function-paren": ["error", {
				anonymous: "never",
				named: "never",
				asyncArrow: "always",
			}],
			"@stylistic/arrow-spacing": "error",
			"@stylistic/space-before-blocks": ["error", "always"],
			"@stylistic/no-multiple-empty-lines": ["error", {
				max: 2,
				maxBOF: 0,
			}],
			"@stylistic/space-infix-ops": "error",
			"@stylistic/space-unary-ops": ["error", {
				words: true,
				nonwords: false,
				overrides: {
					"!": false,
					"!!": false,
					"+": true,
					"-": false,
				},
			}],
			"@stylistic/comma-spacing": ["error", {
				before: false,
				after: true,
			}],
			"@stylistic/no-multi-spaces": "error",
			"@stylistic/spaced-comment": ["error", "always", {
				"line": {
					"markers": ["/"],
					"exceptions": ["-", "+"],
				},
				"block": {
					"markers": ["!"],
					"exceptions": ["*"],
					"balanced": true,
				},
			}],
			"@stylistic/no-trailing-spaces": ["error", {
				skipBlankLines: false,
				ignoreComments: false,
			}],
			"no-unused-vars": ["warn", {
				vars: "all",
				args: "none",
			}],
			"eqeqeq": "error",
			"no-console": "warn",
			"@stylistic/eol-last": ["error", "always"],
			"import/order": ["error", {
				"groups": [
					"builtin",
					"external",
					"internal",
					["parent", "sibling"],
					"index",
					"object",
				],
				"alphabetize": {
					"order": "asc",
					"caseInsensitive": true,
				},
				"newlines-between": "always",
			}],

			// "import/no-default-export": "error",
			"import/newline-after-import": "error",
			"import/consistent-type-specifier-style": ["error", "prefer-inline"],
			"import/no-named-as-default": "off",
			"@stylistic/semi": ["error", "never"],
			"@stylistic/quotes": ["error", "double", {
				avoidEscape: true,
				allowTemplateLiterals: "always",
			}],
			"@stylistic/jsx-quotes": ["error", "prefer-double"],
			...reactHooksPlugin.configs.recommended.rules,
		},
	},
	// Typescript declaration files
	{
		files: ["**/*.d.ts"],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: "latest",
				sourceType: "module",
			},
		},
		rules: {
			"no-unused-vars": "off",
			"@typescript-eslint/member-delimiter-style": "off",
			"@stylistic/ts/indent": "off",
		},
	},
	// JSONC files (tsconfig, etc.)
	{
		files: ["**/tsconfig.json", "**/tsconfig.*.json", "**/*.jsonc", "**/*.json5"],
		plugins: {
			jsonc: jsoncPlugin,
		},
		language: "jsonc/jsonc",
		rules: {
			"jsonc/no-dupe-keys": "error",
			"jsonc/indent": ["error", 2, { ignoredNodes: ["Property"] }],
			"@stylistic/no-multi-spaces": "off",
		},
	},
	// Strict JSON files
	{
		files: ["**/*.json"],
		ignores: ["**/tsconfig.json", "**/tsconfig.*.json"],
		plugins: {
			jsonc: jsoncPlugin,
		},
		language: "jsonc/json",
		rules: {
			"jsonc/no-dupe-keys": "error",
			"jsonc/indent": ["error", 2, { ignoredNodes: ["Property"] }],
			"@stylistic/no-multi-spaces": "off",
		},
	},
	// CSS-in-TS files
	{
		files: ["**/*.css.ts"],
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
