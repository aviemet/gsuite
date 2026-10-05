import { describe, expect, it } from "vitest"

import { cssVariablesResolver, theme } from "@/frontend/lib/theme"

describe("cssVariablesResolver", () => {
	it("uses text colors that clear WCAG AA on the page surfaces", () => {
		const variables = cssVariablesResolver(theme)

		expect(variables.light["--mantine-color-dimmed"]).toBe("var(--mantine-color-gray-7)")
		expect(variables.light["--mantine-color-placeholder"]).toBe("var(--mantine-color-gray-7)")
		expect(variables.light["--mantine-color-default-border"]).toBe("var(--mantine-color-gray-6)")
		expect(variables.light["--mantine-color-error"]).toBe("var(--mantine-color-red-9)")
		expect(variables.dark["--mantine-color-dimmed"]).toBe("var(--mantine-color-dark-0)")
		expect(variables.dark["--mantine-color-placeholder"]).toBe("var(--mantine-color-dark-0)")
		expect(variables.dark["--mantine-color-default-border"]).toBe("var(--mantine-color-dark-1)")
		expect(variables.dark["--mantine-color-error"]).toBe("var(--mantine-color-red-4)")
		expect(theme.primaryShade).toEqual({ light: 7, dark: 6 })
	})
})
