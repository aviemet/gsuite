import { initializeApp, deleteApp } from "firebase/app"
import { getAuth, connectAuthEmulator, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
import { connectFirestoreEmulator, getFirestore, collection, doc, setDoc, Timestamp, getDoc } from "firebase/firestore"

const firebaseConfig = {
	apiKey: "fake-api-key",
	authDomain: "localhost",
	projectId: "gsuite-manager-455721-e0e75",
	storageBucket: "gsuite-manager-455721-e0e75.appspot.com",
	messagingSenderId: "123456789",
	appId: "1:123456789:web:abcdef",
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

// Log the configuration we're using
console.log("Using Firebase config:", {
	projectId: firebaseConfig.projectId,
	emulatorHost: "localhost",
	emulatorPort: 8080,
})

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
		} catch(err: any) {
			if(err.code !== "auth/email-already-in-use") {
				throw err
			}
			userCredential = await signInWithEmailAndPassword(auth, "test@test.com", "password")
		}

		await verifyAdminClaim()

		const templatesRef = collection(db, "templates")
		const template = templates[0]
		const docRef = doc(templatesRef, template.id)

		try {
			// Try to read first to see if we can access Firestore
			const testRead = await getDoc(docRef)
			console.log("Can read from Firestore:", testRead.exists())

			// Try to write with error details
			const writeResult = await setDoc(docRef, {
				...template,
				_test: "Write test",
			}, { merge: true })

			console.log("Write result:", writeResult)

			// Verify the write immediately
			const verifyDoc = await getDoc(docRef)
			if(!verifyDoc.exists()) {
				throw new Error("Document was not created")
			}
			console.log("Document was created successfully:", verifyDoc.data())

		} catch(err) {
			// Log the full error details
			console.error("Firestore operation failed:", {
				error: err,
				errorCode: err.code,
				errorMessage: err.message,
				errorDetails: err.details,
				stack: err.stack,
			})
			throw err
		}
	} catch(error) {
		console.error("Error seeding data:", error)
		process.exit(1)
	} finally {
		// Clean up Firebase app
		await deleteApp(app)
		process.exit(0)
	}
}

seedData()
