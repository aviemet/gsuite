import { Box, TextInput, Button, Stack } from "@mantine/core"
import { Editor } from "@tiptap/core"
import { useState } from "react"

interface BracketsFallbackProps {
	editor: Editor
	node: {
		attrs: {
			content: string
			fallback: string | null
		}
	}
	updateAttributes: (attrs: { fallback: string | null }) => void
}

export function BracketsFallback({ editor, node, updateAttributes }: BracketsFallbackProps) {
	const [fallback, setFallback] = useState(node.attrs.fallback || "")

	const handleSave = () => {
		updateAttributes({ fallback: fallback || null })
	}

	return (
		<Box p="xs">
			<Stack gap="xs">
				<TextInput
					label="Fallback Value"
					description="Value to use if the variable is not available"
					value={ fallback }
					onChange={ (e) => setFallback(e.target.value) }
					placeholder="Enter fallback value..."
				/>
				<Button onClick={ handleSave } size="xs">
					Save
				</Button>
			</Stack>
		</Box>
	)
}
