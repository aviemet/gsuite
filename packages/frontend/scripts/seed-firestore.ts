import { readFirebaseProjectId, resolveFirestoreDatabaseId } from "@gsuite/shared"
import { deleteApp, initializeApp } from "firebase/app"
import { connectAuthEmulator, createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from "firebase/auth"
import { collection, connectFirestoreEmulator, doc, getFirestore, setDoc, Timestamp } from "firebase/firestore"

const firebaseConfig = {
	apiKey: "fake-api-key",
	authDomain: "localhost",
	projectId: readFirebaseProjectId(process.env),
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app, resolveFirestoreDatabaseId(true))

connectAuthEmulator(auth, "http://localhost:9099")
connectFirestoreEmulator(db, "localhost", 8080)

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
		createdAt: Timestamp.fromDate(new Date("2024-02-01")),
		updatedAt: Timestamp.fromDate(new Date("2024-02-01")),
		isActive: false,
	},
]

async function verifyAdminClaim() {
	const idTokenResult = await auth.currentUser?.getIdTokenResult(true)
	if(!idTokenResult?.claims.admin) {
		throw new Error("Please set admin claim manually in the Firebase Auth Emulator UI (http://localhost:9099)")
	}
}

async function seedData() {
	try {
		let userCredential
		try {
			userCredential = await createUserWithEmailAndPassword(auth, "test@test.com", "password")
		} catch (err: any) {
			if(err.code !== "auth/email-already-in-use") {
				throw err
			}
			userCredential = await signInWithEmailAndPassword(auth, "test@test.com", "password")
		}

		await verifyAdminClaim()

		const templatesRef = collection(db, "templates")
		for(const template of templates) {
			try {
				await setDoc(doc(templatesRef, template.id), template)
			} catch (err) {
				throw err
			}
		}
	} catch (error) {
		process.exit(1)
	} finally {
		await deleteApp(app)
		process.exit(0)
	}
}

seedData()
