import { DefaultMantineColor, DefaultMantineSize, MantineColorsTuple } from "@mantine/core"

type ExtendedCustomSpacing =
  | "xxl"
  | "xxxs"
  | DefaultMantineSize

type ExtendedCustomRadius =
  | "xxs"
  | DefaultMantineSize

type ExtendedCustomColors = "harbor" | "copper" | DefaultMantineColor

declare module "@mantine/core" {
	export interface MantineThemeSizesOverride {
		spacing: Record<ExtendedCustomSpacing, string>
		radius: Record<ExtendedCustomRadius, string>
	}

	export interface MantineThemeColorsOverride {
		colors: Record<ExtendedCustomColors, MantineColorsTuple>
	}
}
