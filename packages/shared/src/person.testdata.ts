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
	employeeId: string
	address: string
	photoUrl: string
	costCenter: string
	companyDescription: string
	companyDomain: string
	managerEmail: string
	buildingId: string
	floorName: string
	floorSection: string
	deskCode: string
	website: string
	workWebsite: string
	homeWebsite: string
	blog: string
	profileUrl: string
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
		{ type: "home", number: "+1-555-222-3344" },
	],
	jobTitle: "Product Manager",
	department: "Product",
	organization: "Example Corp",
	location: "San Francisco, CA",
	employeeId: "E-10428",
	address: "123 Market Street, San Francisco, CA 94105",
	photoUrl: "",
	costCenter: "CC-4400",
	companyDescription: "Example Corp builds workplace software.",
	companyDomain: "example.com",
	managerEmail: "sam.lee@example.com",
	buildingId: "SFO-4",
	floorName: "7",
	floorSection: "West",
	deskCode: "7W-18",
	website: "https://example.com/jane",
	workWebsite: "https://example.com",
	homeWebsite: "",
	blog: "",
	profileUrl: "https://example.com/people/jane-doe",
}
