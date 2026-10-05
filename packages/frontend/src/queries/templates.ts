import { useQuery } from "@tanstack/react-query"
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore"

import { useAuth } from "@/frontend/hooks/useAuth"
import { getFirebaseDb } from "@/frontend/lib/firebase"
import { Template } from "@/frontend/types/firebase"
import { isMembershipRole, type MembershipRecord, MEMBERSHIPS_COLLECTION } from "@/shared/workspace"

function hasKey(value: object, key: string): boolean {
	return Object.prototype.hasOwnProperty.call(value, key)
}

function readString(value: object, key: string): string | undefined {
	if(!hasKey(value, key)) return undefined
	const field = Reflect.get(value, key)
	if(typeof field !== "string" || field.length === 0) return undefined
	return field
}

export function parseMembership(uid: string, value: unknown): MembershipRecord | null {
	if(!value || typeof value !== "object") return null
	const customerId = readString(value, "customerId")
	const email = readString(value, "email")
	const createdAt = readString(value, "createdAt")
	if(!hasKey(value, "role")) return null
	const role = Reflect.get(value, "role")
	if(!customerId || !email || !createdAt || !isMembershipRole(role)) return null
	return { uid, customerId, role, email, createdAt }
}

async function fetchMembership(uid: string): Promise<MembershipRecord | null> {
	const snapshot = await getDoc(doc(getFirebaseDb(), MEMBERSHIPS_COLLECTION, uid))
	if(!snapshot.exists()) return null
	return parseMembership(uid, snapshot.data())
}

export function useMembershipQuery() {
	const { user } = useAuth()
	const uid = user?.uid
	return useQuery({
		queryKey: ["membership", uid],
		queryFn: () => {
			if(!uid) throw new Error("You must be signed in")
			return fetchMembership(uid)
		},
		enabled: Boolean(uid),
	})
}

const TEMPLATES_QUERY_KEY = "templates"

async function fetchTemplates(customerId: string): Promise<Template[]> {
	const db = getFirebaseDb()
	const templatesRef = collection(db, "templates")
	const snapshot = await getDocs(query(templatesRef, where("customerId", "==", customerId)))

	return snapshot.docs.map((template) => ({
		id: template.id,
		...template.data(),
	})) as Template[]
}

async function fetchTemplate(id: string): Promise<Template | undefined> {
	const db = getFirebaseDb()
	const docRef = doc(db, "templates", id)
	const docSnap = await getDoc(docRef)
	if(!docSnap.exists()) return undefined
	return { id: docSnap.id, ...docSnap.data() } as Template
}

export function useTemplatesQuery() {
	const membership = useMembershipQuery()
	const customerId = membership.data?.customerId
	const templates = useQuery({
		queryKey: [TEMPLATES_QUERY_KEY, customerId],
		queryFn: () => fetchTemplates(customerId ?? ""),
		enabled: Boolean(customerId),
		staleTime: 1000 * 60 * 5,
	})

	return {
		...templates,
		isLoading: membership.isPending || templates.isLoading,
		error: membership.error ?? templates.error,
	}
}

export function useTemplateQuery(id: string | undefined) {
	return useQuery({
		queryKey: ["template", id],
		queryFn: () => (id ? fetchTemplate(id) : Promise.resolve(undefined)),
		enabled: !!id,
		staleTime: 1000 * 60 * 5,
	})
}
