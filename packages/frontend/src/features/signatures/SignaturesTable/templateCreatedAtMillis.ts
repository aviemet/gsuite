import { type Timestamp } from "firebase/firestore"

export function templateCreatedAtMillis(createdAt: string | Timestamp): number {
	if(typeof createdAt === "string") {
		const parsed = Date.parse(createdAt)
		return Number.isNaN(parsed) ? 0 : parsed
	}

	return createdAt.toMillis()
}
