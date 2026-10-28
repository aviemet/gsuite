import { useQuery } from "@tanstack/react-query"
import { collection, doc, getDoc, getDocs, query, type Timestamp, where } from "firebase/firestore"

import { useAuth } from "@/frontend/hooks/useAuth"
import { getFirebaseDb } from "@/frontend/lib/firebase"
import { Template, type TemplateAssignment } from "@/frontend/types/firebase"
import { isAssignmentType } from "@/shared/template"
import { type MembershipRecord, MEMBERSHIPS_COLLECTION, normalizeMembershipRole } from "@/shared/workspace"

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
	const role = normalizeMembershipRole(Reflect.get(value, "role"))
	if(!customerId || !email || !createdAt || !role) return null
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
export const TEMPLATE_ASSIGNMENTS_QUERY_KEY = "templateAssignments"

function parseTemplateAssignment(id: string, value: unknown): TemplateAssignment | null {
	if(!value || typeof value !== "object") return null
	const templateId = readString(value, "templateId")
	const targetId = readString(value, "targetId")
	const createdBy = readString(value, "createdBy")
	const customerId = readString(value, "customerId")
	const assignmentTypeValue = readString(value, "assignmentType")
	if(!templateId || !targetId || !createdBy || !customerId || !assignmentTypeValue) return null
	if(!isAssignmentType(assignmentTypeValue)) return null
	const priorityValue = Reflect.get(value, "priority")
	const priority = typeof priorityValue === "number" ? priorityValue : 0
	const createdAtValue = Reflect.get(value, "createdAt")
	const updatedAtValue = Reflect.get(value, "updatedAt")
	const createdAt = typeof createdAtValue === "string" || isTimestampLike(createdAtValue)
		? createdAtValue
		: null
	const updatedAt = typeof updatedAtValue === "string" || isTimestampLike(updatedAtValue)
		? updatedAtValue
		: null
	if(createdAt === null || updatedAt === null) return null
	return {
		id,
		templateId,
		assignmentType: assignmentTypeValue,
		targetId,
		priority,
		createdBy,
		createdAt,
		updatedAt,
		isActive: Reflect.get(value, "isActive") !== false,
		customerId,
	}
}

function isTimestampLike(value: unknown): value is Timestamp {
	return typeof value === "object"
		&& value !== null
		&& "toMillis" in value
		&& typeof Reflect.get(value, "toMillis") === "function"
}

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

async function fetchTemplateAssignments(customerId: string): Promise<TemplateAssignment[]> {
	const db = getFirebaseDb()
	const assignmentsRef = collection(db, "templateAssignments")
	const snapshot = await getDocs(query(assignmentsRef, where("customerId", "==", customerId)))
	const assignments: TemplateAssignment[] = []
	for(const assignmentDoc of snapshot.docs) {
		const parsed = parseTemplateAssignment(assignmentDoc.id, assignmentDoc.data())
		if(parsed) assignments.push(parsed)
	}
	return assignments
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

export function useTemplateAssignmentsQuery() {
	const membership = useMembershipQuery()
	const customerId = membership.data?.customerId
	const assignments = useQuery({
		queryKey: [TEMPLATE_ASSIGNMENTS_QUERY_KEY, customerId],
		queryFn: () => fetchTemplateAssignments(customerId ?? ""),
		enabled: Boolean(customerId),
		staleTime: 1000 * 60 * 5,
	})

	return {
		...assignments,
		isLoading: membership.isPending || assignments.isLoading,
		error: membership.error ?? assignments.error,
	}
}
