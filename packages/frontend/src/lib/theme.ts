import { createTheme, DEFAULT_THEME, MantineSpacingValues, mergeMantineTheme, type MantineTheme } from "@mantine/core"
import { themeToVars } from "@mantine/vanilla-extract"

import breakpoints from "./breakpoints.mjs"

type CustomMantineTheme = Omit<MantineTheme, "spacing" | "other"> & {
	spacing: Partial<MantineSpacingValues & {
		xxl: string
		xxs: string
	}>
	other: any
}

export const defaultColor = "blue"

export const themeObject: Partial<CustomMantineTheme> = {
	breakpoints,
	defaultRadius: "sm",
	spacing: {
		xxl: "calc(2.5rem * var(--mantine-scale))",
		xs: "calc(0.5rem * var(--mantine-scale))",
		xxs: "calc(0.25rem * var(--mantine-scale))",
	},
	shadows: {
		xs: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
		sm: "0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)",
		md: "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)",
		lg: "0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)",
		xl: "0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)",
		xxl: "0 29px 52px rgba(0,0,0,0.40), 0 25px 16px rgba(0,0,0,0.20)",
	},
	components: {
		Modal: {
			defaultProps: {
				centered: true,
				radius: "sm",
				padding: "md",
			},
		},
	},
	other: {
		header: {
			height: 50,
		},
		navbar: {
			width: {
				closed: 50,
				open: 210,
			},
		},
		footer: {
			height: 35,
		},
		table: {
			sortButtonHeight: 5,
			sortButtonWidth: 6,
		},
	},
}

export const theme = mergeMantineTheme(DEFAULT_THEME, createTheme(themeObject))

export const vars = themeToVars(mergeMantineTheme(theme, {

}))
