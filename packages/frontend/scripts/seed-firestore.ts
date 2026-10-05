import {
	CUSTOMERS_COLLECTION,
	membershipRoles,
	MEMBERSHIPS_COLLECTION,
	readFirebaseProjectId,
	resolveFirestoreDatabaseId,
	SEED_CUSTOMER_ID,
	SEED_PRIMARY_DOMAIN,
	SEED_USER_EMAIL,
	SEED_WORKSPACE_ADMIN_EMAIL,
} from "@gsuite/shared"
import { initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore, Timestamp } from "firebase-admin/firestore"

process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080"
process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099"

const app = initializeApp({ projectId: readFirebaseProjectId(process.env) })
const auth = getAuth(app)
const db = getFirestore(app, resolveFirestoreDatabaseId(true))

const templates = [
	{
		id: "template1",
		name: "Professional Signature",
		content: `
			<div>
				<p><strong>{{name}}</strong></p>
				<p>{{title}}</p>
				<p>{{department}}</p>
				<p>{{email}} | {{phone}}</p>
				{{#if linkedin}}<p>LinkedIn: {{linkedin}}</p>{{/if}}
			</div>
		`,
		variables: ["name", "title", "department", "email", "phone", "linkedin"],
		conditions: ["linkedin?"],
		assignedGroup: "Engineering",
		isScheduled: true,
		createdBy: "admin",
		customerId: SEED_CUSTOMER_ID,
		createdAt: Timestamp.fromDate(new Date("2024-01-01")),
		updatedAt: Timestamp.fromDate(new Date("2024-01-01")),
		isActive: true,
	},
	{
		id: "template2",
		name: "Simple Signature",
		content: `
			<div>
				<p>{{name}}</p>
				<p>{{email}}</p>
			</div>
		`,
		variables: ["name", "email"],
		conditions: [],
		assignedGroup: "All Employees",
		isScheduled: false,
		createdBy: "admin",
		customerId: SEED_CUSTOMER_ID,
		createdAt: Timestamp.fromDate(new Date("2024-01-15")),
		updatedAt: Timestamp.fromDate(new Date("2024-01-15")),
		isActive: true,
	},
	{
		id: "template3",
		name: "Marketing Signature",
		content: `
			<div>
				<p><strong>{{name}}</strong> | {{title}}</p>
				<p>{{email}} | {{phone}}</p>
				{{#if campaign}}<p>Current Campaign: {{campaign}}</p>{{/if}}
				{{#if social}}<p>Follow us: {{social}}</p>{{/if}}
			</div>
		`,
		variables: ["name", "title", "email", "phone", "campaign", "social"],
		conditions: ["campaign?", "social?"],
		assignedGroup: null,
		isScheduled: true,
		createdBy: "admin",
		customerId: SEED_CUSTOMER_ID,
		createdAt: Timestamp.fromDate(new Date("2024-02-01")),
		updatedAt: Timestamp.fromDate(new Date("2024-02-01")),
		isActive: false,
	},
]

async function seedUser() {
	try {
		return await auth.getUserByEmail(SEED_USER_EMAIL)
	} catch{
		return auth.createUser({
			email: SEED_USER_EMAIL,
			password: "password",
			emailVerified: true,
		})
	}
}

async function seedData() {
	try {
		const user = await seedUser()
		const nowIso = new Date().toISOString()
		await db.collection(CUSTOMERS_COLLECTION).doc(SEED_CUSTOMER_ID).set({
			id: SEED_CUSTOMER_ID,
			primaryDomain: SEED_PRIMARY_DOMAIN,
			workspaceAdminEmail: SEED_WORKSPACE_ADMIN_EMAIL,
			createdAt: nowIso,
			updatedAt: nowIso,
		})
		await db.collection(MEMBERSHIPS_COLLECTION).doc(user.uid).set({
			uid: user.uid,
			customerId: SEED_CUSTOMER_ID,
			role: membershipRoles.owner,
			email: SEED_USER_EMAIL,
			createdAt: nowIso,
		})
		for(const template of templates) {
			await db.collection("templates").doc(template.id).set(template)
		}
	} catch{
		process.exitCode = 1
	} finally {
		process.exit()
	}
}

seedData()
