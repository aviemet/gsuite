import { useQuery } from "@tanstack/react-query"
import { collection, getDocs, onSnapshot, query } from "firebase/firestore"

import { getFirebaseDb } from "@/frontend/lib/firebase"
import { Template } from "@/frontend/types/firebase"

const TEMPLATES_QUERY_KEY = ["templates"] as const

async function fetchTemplates(): Promise<Template[]> {
	const db = getFirebaseDb()
	const templatesRef = collection(db, "templates")
	const q = query(templatesRef)
	const snapshot = await getDocs(q)

	return snapshot.docs.map((doc) => ({
		id: doc.id,
		...doc.data(),
	})) as Template[]
}

export function useTemplatesQuery() {
	return useQuery({
		queryKey: TEMPLATES_QUERY_KEY,
		queryFn: fetchTemplates,
		staleTime: 1000 * 60 * 5, // 5 minutes
	})
}
