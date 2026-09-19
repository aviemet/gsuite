import { Editor } from "@tiptap/core"
import { Mark, Node as ProseMirrorNode } from "@tiptap/pm/model"

interface EmailTextStyles {
	fontFamily: string | null
	color: string | null
	backgroundColor: string | null
	textTransform: string | null
}

const EMPTY_TEXT_STYLES: EmailTextStyles = {
	fontFamily: null,
	color: null,
	backgroundColor: null,
	textTransform: null,
}

const MARK_WRAP_ORDER = [
	"link",
	"textStyle",
	"highlight",
	"bold",
	"italic",
	"underline",
	"strike",
	"code",
	"superscript",
	"subscript",
]

function escapeHtml(text: string): string {
	return text
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll("\"", "&quot;")
}

function escapeAttribute(value: string): string {
	return escapeHtml(value)
}

function stringAttr(value: unknown): string | null {
	if(typeof value !== "string" || value.length === 0) {
		return null
	}

	return value
}

function markRank(name: string): number {
	const index = MARK_WRAP_ORDER.indexOf(name)
	if(index === -1) {
		return MARK_WRAP_ORDER.length
	}

	return index
}

function textStyleFromMarks(marks: readonly Mark[]): EmailTextStyles {
	const textStyle = marks.find((mark) => mark.type.name === "textStyle")
	if(!textStyle) {
		return EMPTY_TEXT_STYLES
	}

	return {
		fontFamily: stringAttr(textStyle.attrs.fontFamily),
		color: stringAttr(textStyle.attrs.color),
		backgroundColor: stringAttr(textStyle.attrs.backgroundColor),
		textTransform: stringAttr(textStyle.attrs.textTransform),
	}
}

function collectHoistedStyles(block: ProseMirrorNode): EmailTextStyles {
	let fontFamily: string | null | undefined
	let color: string | null | undefined
	let backgroundColor: string | null | undefined
	let textTransform: string | null | undefined
	let sawContent = false

	block.descendants((node) => {
		if(node.type.name === "hardBreak") {
			return true
		}

		if(!node.isInline || (!node.isText && node.type.name !== "brackets")) {
			return true
		}

		sawContent = true
		const styles = textStyleFromMarks(node.marks)
		fontFamily = fontFamily === undefined ? styles.fontFamily : (fontFamily === styles.fontFamily ? fontFamily : null)
		color = color === undefined ? styles.color : (color === styles.color ? color : null)
		backgroundColor = backgroundColor === undefined
			? styles.backgroundColor
			: (backgroundColor === styles.backgroundColor ? backgroundColor : null)
		textTransform = textTransform === undefined
			? styles.textTransform
			: (textTransform === styles.textTransform ? textTransform : null)
		return true
	})

	if(!sawContent) {
		return EMPTY_TEXT_STYLES
	}

	return {
		fontFamily: fontFamily ?? null,
		color: color ?? null,
		backgroundColor: backgroundColor ?? null,
		textTransform: textTransform ?? null,
	}
}

function compileStyle(styles: EmailTextStyles, extra: string[]): string {
	const parts = [...extra]
	if(styles.fontFamily) {
		parts.push(`font-family: ${ styles.fontFamily }`)
	}

	if(styles.color) {
		parts.push(`color: ${ styles.color }`)
	}

	if(styles.backgroundColor) {
		parts.push(`background-color: ${ styles.backgroundColor }`)
	}

	if(styles.textTransform) {
		parts.push(`text-transform: ${ styles.textTransform }`)
	}

	return parts.join("; ")
}

function openTag(tag: string, style: string): string {
	if(style.length === 0) {
		return `<${ tag }>`
	}

	return `<${ tag } style="${ escapeAttribute(style) }">`
}

function wrapMark(html: string, mark: Mark, hoisted: EmailTextStyles): string {
	switch(mark.type.name) {
		case "bold":
			return `<b>${ html }</b>`
		case "italic":
			return `<i>${ html }</i>`
		case "underline":
			return `<u>${ html }</u>`
		case "strike":
			return `<s>${ html }</s>`
		case "code":
			return `<code>${ html }</code>`
		case "superscript":
			return `<sup>${ html }</sup>`
		case "subscript":
			return `<sub>${ html }</sub>`
		case "highlight": {
			const highlightColor = stringAttr(mark.attrs.color) ?? "#ffe066"
			return `<span style="background-color: ${ escapeAttribute(highlightColor) }">${ html }</span>`
		}
		case "link": {
			const href = stringAttr(mark.attrs.href)
			if(!href) {
				return html
			}

			return `<a href="${ escapeAttribute(href) }">${ html }</a>`
		}
		case "textStyle": {
			const remaining = compileStyle({
				fontFamily: stringAttr(mark.attrs.fontFamily) === hoisted.fontFamily ? null : stringAttr(mark.attrs.fontFamily),
				color: stringAttr(mark.attrs.color) === hoisted.color ? null : stringAttr(mark.attrs.color),
				backgroundColor: stringAttr(mark.attrs.backgroundColor) === hoisted.backgroundColor
					? null
					: stringAttr(mark.attrs.backgroundColor),
				textTransform: stringAttr(mark.attrs.textTransform) === hoisted.textTransform
					? null
					: stringAttr(mark.attrs.textTransform),
			}, [])
			if(remaining.length === 0) {
				return html
			}

			return `<span style="${ escapeAttribute(remaining) }">${ html }</span>`
		}
		default:
			return html
	}
}

function wrapWithMarks(html: string, marks: readonly Mark[], hoisted: EmailTextStyles): string {
	const ordered = [...marks].sort((left, right) => markRank(right.type.name) - markRank(left.type.name))
	let result = html
	for(const mark of ordered) {
		result = wrapMark(result, mark, hoisted)
	}

	return result
}

function bracketsText(node: ProseMirrorNode): string {
	const content = stringAttr(node.attrs.content) ?? ""
	const fallback = stringAttr(node.attrs.fallback)
	if(fallback) {
		return `{{${ content }|"${ fallback }"}}`
	}

	return `{{${ content }}}`
}

function serializeInline(block: ProseMirrorNode, hoisted: EmailTextStyles): string {
	const parts: string[] = []
	block.forEach((child) => {
		if(child.type.name === "hardBreak") {
			parts.push("<br>")
			return
		}

		if(child.type.name === "brackets") {
			parts.push(wrapWithMarks(bracketsText(child), child.marks, hoisted))
			return
		}

		if(child.isText) {
			parts.push(wrapWithMarks(escapeHtml(child.text ?? ""), child.marks, hoisted))
			return
		}

		if(child.isInline) {
			parts.push(serializeInline(child, hoisted))
		}
	})

	return parts.join("")
}

function serializeStyledBlock(tag: string, node: ProseMirrorNode, extraStyle: string[] = []): string {
	const hoisted = collectHoistedStyles(node)
	const textAlign = stringAttr(node.attrs.textAlign)
	const blockStyle = stringAttr(node.attrs.blockStyle)
	const extra = [...extraStyle]
	if(blockStyle) {
		extra.push(blockStyle)
	}
	if(textAlign && textAlign !== "left") {
		extra.push(`text-align: ${ textAlign }`)
	}

	const inner = serializeInline(node, hoisted)
	const style = compileStyle(hoisted, extra)
	return `${ openTag(tag, style) }${ inner.length > 0 ? inner : "<br>" }</${ tag }>`
}

function serializeListItem(node: ProseMirrorNode): string {
	const parts: string[] = []
	let hoisted = EMPTY_TEXT_STYLES
	let extra: string[] = []

	node.forEach((child, _offset, index) => {
		if(child.type.name === "paragraph" && index === 0) {
			hoisted = collectHoistedStyles(child)
			const textAlign = stringAttr(child.attrs.textAlign)
			if(textAlign && textAlign !== "left") {
				extra = [`text-align: ${ textAlign }`]
			}

			parts.push(serializeInline(child, hoisted))
			return
		}

		parts.push(serializeBlock(child))
	})

	const inner = parts.join("")
	const style = compileStyle(hoisted, extra)
	return `${ openTag("li", style) }${ inner.length > 0 ? inner : "<br>" }</li>`
}

function serializeChildren(node: ProseMirrorNode): string {
	const parts: string[] = []
	node.forEach((child) => {
		parts.push(serializeBlock(child))
	})

	return parts.join("")
}

function serializeBlock(node: ProseMirrorNode): string {
	switch(node.type.name) {
		case "paragraph":
			return serializeStyledBlock("div", node)
		case "heading": {
			const level = typeof node.attrs.level === "number" ? node.attrs.level : 1
			const tag = `h${ level }`
			return serializeStyledBlock(tag, node, ["margin: 0"])
		}
		case "blockquote":
			return `<blockquote>${ serializeChildren(node) }</blockquote>`
		case "horizontalRule":
			return `<hr style="border: none; border-top: 1px solid #cccccc; margin: 8px 0;">`
		case "bulletList":
			return `<ul>${ serializeChildren(node) }</ul>`
		case "orderedList":
			return `<ol>${ serializeChildren(node) }</ol>`
		case "listItem":
			return serializeListItem(node)
		default:
			if(node.isTextblock) {
				return serializeStyledBlock("div", node)
			}

			if(node.childCount > 0) {
				return serializeChildren(node)
			}

			return ""
	}
}

export function serializeEmailSignatureHtml(editor: Editor): string {
	return serializeChildren(editor.state.doc)
}
