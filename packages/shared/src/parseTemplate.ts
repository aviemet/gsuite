export function safeTemplateParse(
	template: string,
	context: Record<string, string | undefined>,
): string {
	template = template.replace(/\{\{#if\s+(\w+)\s*\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, key, content) => {
		return context[key] ? content : ""
	})
	template = template.replace(/\{\{#if\s+\w+\s*\}\}/g, "")
	template = template.replace(/\{\{\/if\}\}/g, "")
	template = template.replace(/\{\{\{\s*(\w+)\s*\}\}\}/g, (_, key: string) => {
		return context[key] ?? ""
	})
	template = template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => {
		return context[key] ?? ""
	})
	return template
}

export function extractTemplateVariables(content: string): string[] {
	const variables = new Set<string>()
	const pattern = /\{\{\{?\s*(\w+)\s*\}?\}\}/g
	let match = pattern.exec(content)
	while(match) {
		const token = match[1]
		if(token !== "if") {
			variables.add(token)
		}
		match = pattern.exec(content)
	}
	return [...variables]
}
