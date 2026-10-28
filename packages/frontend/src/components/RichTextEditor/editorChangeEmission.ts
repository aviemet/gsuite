interface EditorChangeEmissionInput {
	skipNext: boolean
	html: string
	lastEmittedHtml: string
}

interface EditorChangeEmissionResult {
	skipNext: boolean
	lastEmittedHtml: string
	emitHtml: string | null
}

export function resolveEditorChangeEmission({
	skipNext,
	html,
	lastEmittedHtml,
}: EditorChangeEmissionInput): EditorChangeEmissionResult {
	if(skipNext) {
		return {
			skipNext: false,
			lastEmittedHtml: html,
			emitHtml: null,
		}
	}

	if(html === lastEmittedHtml) {
		return {
			skipNext: false,
			lastEmittedHtml,
			emitHtml: null,
		}
	}

	return {
		skipNext: false,
		lastEmittedHtml: html,
		emitHtml: html,
	}
}
