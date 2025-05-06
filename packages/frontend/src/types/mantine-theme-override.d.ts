import { DefaultMantineSize } from "@mantine/core"

type ExtendedCustomSpacing =
  | "xxl"
  | "xxxs"
  | DefaultMantineSize;

type ExtendedCustomRadius =
  | "xxs"
  | DefaultMantineSize;

declare module "@mantine/core" {
	export interface MantineThemeSizesOverride {
		spacing: Record<ExtendedCustomSpacing, string>
		radius: Record<ExtendedCustomRadius, string>
	}
}
