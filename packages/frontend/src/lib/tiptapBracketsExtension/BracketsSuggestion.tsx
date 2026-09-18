import { Box, List, Text, UnstyledButton } from "@mantine/core"
import { Editor } from "@tiptap/core"
import { ReactRenderer, ReactNodeViewRenderer } from "@tiptap/react"
import { useState, useEffect, useRef } from "react"
import tippy, { Instance as TippyInstance } from "tippy.js"

interface SuggestionProps {
	editor: Editor
	range: { from: number, to: number }
	clientRect: () => DOMRect | null
	event?: KeyboardEvent
}

interface SuggestionItem {
	title: string
	description?: string
}

const items: SuggestionItem[] = [
	{ title: "first_name", description: "User's first name" },
	{ title: "last_name", description: "User's last name" },
	{ title: "email", description: "User's email address" },
	{ title: "company", description: "User's company name" },
]

export const BracketsSuggestion = {
	create: () => {
		const component = new ReactRenderer(SuggestionList, {
			props: {},
			editor: null as unknown as Editor,
		})

		return {
			onStart: (props: SuggestionProps) => {
				component.updateProps(props)
			},
			onUpdate: (props: SuggestionProps) => {
				component.updateProps(props)
			},
			onKeyDown: (props: SuggestionProps) => {
				if(props.event?.key === "Escape") {
					return true
				}
				return component.ref?.onKeyDown(props)
			},
			onExit: () => {
				component.destroy()
			},
		}
	},
}

function SuggestionList({ editor, range, clientRect }: SuggestionProps) {
	const [selectedIndex, setSelectedIndex] = useState(0)
	const [filteredItems, setFilteredItems] = useState(items)
	const componentRef = useRef<{ onKeyDown: (props: SuggestionProps) => boolean }>()

	useEffect(() => {
		const popup = tippy(document.body, {
			getReferenceClientRect: clientRect,
			appendTo: () => document.body,
			content: componentRef.current,
			showOnCreate: true,
			interactive: true,
			trigger: "manual",
			placement: "bottom-start",
		})

		return () => {
			popup[0].destroy()
		}
	}, [])

	const onKeyDown = (props: SuggestionProps) => {
		if(props.event?.key === "ArrowUp") {
			setSelectedIndex((index) => (index > 0 ? index - 1 : filteredItems.length - 1))
			return true
		}

		if(props.event?.key === "ArrowDown") {
			setSelectedIndex((index) => (index < filteredItems.length - 1 ? index + 1 : 0))
			return true
		}

		if(props.event?.key === "Enter") {
			selectItem(filteredItems[selectedIndex])
			return true
		}

		return false
	}

	const selectItem = (item: SuggestionItem) => {
		editor
			.chain()
			.focus()
			.insertContentAt(range, [
				{
					type: "brackets",
					attrs: { content: item.title },
				},
			])
			.run()
	}

	return (
		<Box p="xs" style={ { maxHeight: "300px", overflowY: "auto" } }>
			<List spacing="xs" size="sm">
				{ filteredItems.map((item, index) => (
					<List.Item
						key={ item.title }
						component={ UnstyledButton }
						onClick={ () => selectItem(item) }
						style={ {
							backgroundColor: index === selectedIndex ? "var(--mantine-color-blue-0)" : "transparent",
							padding: "4px 8px",
							borderRadius: "4px",
							cursor: "pointer",
						} }
					>
						<Text size="sm" fw={ 500 }>
							{ item.title }
						</Text>
						{ item.description && (
							<Text size="xs" c="dimmed">
								{ item.description }
							</Text>
						) }
					</List.Item>
				)) }
			</List>
		</Box>
	)
}
