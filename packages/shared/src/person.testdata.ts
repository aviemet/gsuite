export interface Person {
	id: string
	firstName: string
	lastName: string
	displayName: string
	primaryEmail: string
	alternateEmails: string[]
	phoneNumbers: {
		type: "mobile" | "work" | "home"
		number: string
	}[]
	jobTitle: string
	department: string
	organization: string
	location: string
}

export const samplePerson: Person = {
	id: "user-123",
	firstName: "Jane",
	lastName: "Doe",
	displayName: "Jane Doe",
	primaryEmail: "jane.doe@example.com",
	alternateEmails: ["jane.doe@workplace.com", "j.doe@gmail.com"],
	phoneNumbers: [
		{ type: "mobile", number: "+1-555-123-4567" },
		{ type: "work", number: "+1-555-987-6543" },
	],
	jobTitle: "Product Manager",
	department: "Product",
	organization: "Example Corp",
	location: "San Francisco, CA",
}
