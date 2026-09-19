import { Template } from "@/frontend/types/firebase"

export const START_TEMPLATE_ORIGINS = ["saved", "predefined"] as const

export type StartTemplateOrigin = typeof START_TEMPLATE_ORIGINS[number]

export interface StartTemplate {
	id: string
	name: string
	content: string
	origin: StartTemplateOrigin
}

export const PREDEFINED_TEMPLATE_ID_PREFIX = "predefined:"

export const predefinedTemplates: StartTemplate[] = [
	{
		id: `${PREDEFINED_TEMPLATE_ID_PREFIX}corporate-basic`,
		name: "Corporate Basic",
		origin: "predefined",
		content: `
			<div style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #111111; line-height: 1.4;">
				<div style="font-weight: 700; font-size: 15px;">{{fullName}}</div>
				<div>{{jobTitle}}</div>
				<div>{{department}} | {{company}}</div>
				<div style="margin-top: 8px;">{{email}}</div>
				<div>{{workPhone}}</div>
			</div>
		`,
	},
	{
		id: `${PREDEFINED_TEMPLATE_ID_PREFIX}modern-minimal`,
		name: "Modern Minimal",
		origin: "predefined",
		content: `
			<div style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #222222; line-height: 1.45;">
				<div style="font-weight: 700;">{{fullName}}</div>
				<div style="color: #666666;">{{jobTitle}}</div>
				<div style="margin-top: 6px;">{{email}}</div>
			</div>
		`,
	},
	{
		id: `${PREDEFINED_TEMPLATE_ID_PREFIX}two-column-professional`,
		name: "Two-Column Professional",
		origin: "predefined",
		content: `
			<table cellpadding="0" cellspacing="0" style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #111111;">
				<tr>
					<td style="padding-right: 16px; border-right: 2px solid #1c7ed6; vertical-align: top;">
						<div style="font-weight: 700; font-size: 15px;">{{fullName}}</div>
						<div>{{jobTitle}}</div>
						<div>{{department}}</div>
					</td>
					<td style="padding-left: 16px; vertical-align: top;">
						<div>{{email}}</div>
						<div>{{workPhone}}</div>
						<div>{{company}}</div>
						<div>{{website}}</div>
					</td>
				</tr>
			</table>
		`,
	},
	{
		id: `${PREDEFINED_TEMPLATE_ID_PREFIX}clean-single-column`,
		name: "Clean Single Column",
		origin: "predefined",
		content: `
			<div style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #111111; line-height: 1.5;">
				<div style="font-weight: 700;">{{fullName}}</div>
				<div>{{jobTitle}}, {{department}}</div>
				<div>{{company}}</div>
				<div style="margin-top: 8px;">{{email}} · {{workPhone}}</div>
				<div>{{address}}</div>
			</div>
		`,
	},
	{
		id: `${PREDEFINED_TEMPLATE_ID_PREFIX}centered-brand-block`,
		name: "Centered Brand Block",
		origin: "predefined",
		content: `
			<div style="text-align: center; font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #111111; line-height: 1.45;">
				<div style="font-size: 18px; font-weight: 700; color: #1c7ed6;">{{company}}</div>
				<div style="font-weight: 700; margin-top: 8px;">{{fullName}}</div>
				<div>{{jobTitle}} · {{department}}</div>
				<div style="margin-top: 8px;">W: {{workPhone}}&nbsp;&nbsp;M: {{mobile}}</div>
				<div style="color: #1c7ed6;">{{email}}</div>
				<div style="margin-top: 8px; color: #666666;">{{address}}</div>
				<div style="color: #1c7ed6;">{{website}}</div>
			</div>
		`,
	},
	{
		id: `${PREDEFINED_TEMPLATE_ID_PREFIX}left-accent`,
		name: "Left Accent",
		origin: "predefined",
		content: `
			<table cellpadding="0" cellspacing="0" style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #111111;">
				<tr>
					<td style="width: 6px; background-color: #1c7ed6;"></td>
					<td style="padding-left: 12px; vertical-align: top;">
						<div style="font-weight: 700; font-size: 15px;">{{fullName}}</div>
						<div>{{jobTitle}} | {{company}}</div>
						<div style="margin-top: 6px;">{{email}} | {{workPhone}}</div>
					</td>
				</tr>
			</table>
		`,
	},
	{
		id: `${PREDEFINED_TEMPLATE_ID_PREFIX}compact-stack`,
		name: "Compact Stack",
		origin: "predefined",
		content: `
			<div style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #111111; line-height: 1.4;">
				<div><strong>{{fullName}}</strong> · {{jobTitle}}</div>
				<div>{{email}} · {{workPhone}}</div>
				<div>{{company}}</div>
			</div>
		`,
	},
	{
		id: `${PREDEFINED_TEMPLATE_ID_PREFIX}formal-letterhead`,
		name: "Formal Letterhead",
		origin: "predefined",
		content: `
			<div style="font-family: Georgia, 'Times New Roman', serif; font-size: 13px; color: #111111; line-height: 1.5;">
				<div style="font-size: 16px; font-weight: 700; letter-spacing: 0.02em;">{{fullName}}</div>
				<div style="font-style: italic;">{{jobTitle}}</div>
				<div style="margin-top: 10px; border-top: 1px solid #cccccc; padding-top: 8px;">
					<div>{{company}}</div>
					<div>{{email}}</div>
					<div>{{workPhone}}</div>
					<div>{{address}}</div>
				</div>
			</div>
		`,
	},
]

export function isPredefinedTemplateId(templateId: string): boolean {
	return templateId.startsWith(PREDEFINED_TEMPLATE_ID_PREFIX)
}

export function toSavedStartTemplate(template: Template): StartTemplate {
	return {
		id: template.id,
		name: template.name,
		content: template.content,
		origin: "saved",
	}
}

export function findStartTemplate(templateId: string, savedTemplates: Template[]): StartTemplate | undefined {
	const predefinedTemplate = predefinedTemplates.find((template) => template.id === templateId)
	if(predefinedTemplate) return predefinedTemplate

	const savedTemplate = savedTemplates.find((template) => template.id === templateId)
	if(!savedTemplate) return undefined

	return toSavedStartTemplate(savedTemplate)
}
