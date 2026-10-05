import { collection, doc, onSnapshot, query, where } from "firebase/firestore"
import { useEffect, useState } from "react"

import { useAuth } from "@/frontend/hooks/useAuth"
import { getFirebaseDb } from "@/frontend/lib/firebase"
import { Template } from "@/frontend/types/firebase"
import { MEMBERSHIPS_COLLECTION } from "@/shared/workspace"

export const useTemplates = () => {
	const { user } = useAuth()
	const [templates, setTemplates] = useState<Template[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)

	useEffect(() => {
		if(!user) return

		const db = getFirebaseDb()
		let unsubscribeTemplates = () => {}
		const unsubscribeMembership = onSnapshot(
			doc(db, MEMBERSHIPS_COLLECTION, user.uid),
			(membershipSnapshot) => {
				unsubscribeTemplates()
				const customerId = membershipSnapshot.data()?.customerId
				if(typeof customerId !== "string") {
					setTemplates([])
					setLoading(false)
					return
				}

				unsubscribeTemplates = onSnapshot(
					query(collection(db, "templates"), where("customerId", "==", customerId)),
					(snapshot) => {
						setTemplates(snapshot.docs.map((template) => ({
							id: template.id,
							...template.data(),
						})) as Template[])
						setLoading(false)
					},
					(err) => {
						setError(err)
						setLoading(false)
					},
				)
			},
			(err) => {
				setError(err)
				setLoading(false)
			},
		)

		return () => {
			unsubscribeMembership()
			unsubscribeTemplates()
		}
	}, [user])

	return { templates: user ? templates : [], loading: user ? loading : false, error: user ? error : null }
}
