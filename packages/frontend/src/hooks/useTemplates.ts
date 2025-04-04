import { collection, onSnapshot, query } from "firebase/firestore"
import { useEffect, useState } from "react"

import { getFirebaseDb } from "@/frontend/lib/firebase"
import { Template } from "@/frontend/types/firebase"

export const useTemplates = () => {
	const [templates, setTemplates] = useState<Template[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)

	useEffect(() => {
		const db = getFirebaseDb()
		const templatesRef = collection(db, "templates")
		const q = query(templatesRef)

		const unsubscribe = onSnapshot(
			q,
			(snapshot) => {
				const templatesData = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				})) as Template[]
				setTemplates(templatesData)
				setLoading(false)
			},
			(err) => {
				setError(err as Error)
				setLoading(false)
			},
		)

		return () => unsubscribe()
	}, [])

	return { templates, loading, error }
}
