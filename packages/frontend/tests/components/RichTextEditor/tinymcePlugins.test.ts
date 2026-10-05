import tinymce from "tinymce"
import { describe, expect, it } from "vitest"

import "tinymce/plugins/autoresize"
import "tinymce/plugins/link"
import "tinymce/plugins/lists"

describe("tinymce plugin registration", () => {
	it("loads core before plugin side effects", () => {
		expect(tinymce).toBeDefined()
		expect(tinymce.PluginManager.get("lists")).toBeTruthy()
		expect(tinymce.PluginManager.get("link")).toBeTruthy()
		expect(tinymce.PluginManager.get("autoresize")).toBeTruthy()
	})
})
