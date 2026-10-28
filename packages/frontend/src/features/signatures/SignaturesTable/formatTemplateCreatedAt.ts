import { type Timestamp } from "firebase/firestore"

import { templateCreatedAtMillis } from "./templateCreatedAtMillis"

const createdAtFormatter = new Intl.DateTimeFormat(undefined, {
	year: "numeric",
	month: "short",
	day: "numeric",
})

export function formatTemplateCreatedAt(createdAt: string | Timestamp): string {
	return createdAtFormatter.format(new Date(templateCreatedAtMillis(createdAt)))
}
