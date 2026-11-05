export interface DirectoryPhoneNumber {
	type: "mobile" | "work" | "home"
	number: string
}

export interface DirectoryUser {
	email: string
	displayName: string
	givenName: string
	familyName: string
	signatureHtml: string
	groupIds: string[]
	organizationalUnitPaths: string[]
	jobTitle: string
	department: string
	organization: string
	location: string
	employeeId: string
	address: string
	photoUrl: string
	costCenter: string
	companyDescription: string
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
	phoneNumbers: DirectoryPhoneNumber[]
}

export function emptyDirectoryProfile(): Omit<DirectoryUser, "email" | "displayName" | "signatureHtml" | "groupIds" | "organizationalUnitPaths"> {
	return {
		givenName: "",
		familyName: "",
		jobTitle: "",
		department: "",
		organization: "",
		location: "",
		employeeId: "",
		address: "",
		photoUrl: "",
		costCenter: "",
		companyDescription: "",
		managerEmail: "",
		buildingId: "",
		floorName: "",
		floorSection: "",
		deskCode: "",
		website: "",
		workWebsite: "",
		homeWebsite: "",
		blog: "",
		profileUrl: "",
		phoneNumbers: [],
	}
}

export const directoryGroupMemberRoles = {
	owner: "OWNER",
	manager: "MANAGER",
	member: "MEMBER",
} as const

export type DirectoryGroupMemberRole = typeof directoryGroupMemberRoles[keyof typeof directoryGroupMemberRoles]

export interface DirectoryGroupMember {
	email: string
	role: DirectoryGroupMemberRole
}

export function isDirectoryGroupMemberRole(value: unknown): value is DirectoryGroupMemberRole {
	return value === directoryGroupMemberRoles.owner
		|| value === directoryGroupMemberRoles.manager
		|| value === directoryGroupMemberRoles.member
}

export interface DirectoryGroup {
	id: string
	name: string
	email: string
	description: string
	members: DirectoryGroupMember[]
}

export interface DirectoryOrganizationalUnit {
	path: string
	name: string
}

export const directoryUsers: DirectoryUser[] = [
	{
		...emptyDirectoryProfile(),
		email: "jane.doe@example.com",
		displayName: "Jane Doe",
		givenName: "Jane",
		familyName: "Doe",
		signatureHtml: `
			<div>
				<p><strong>{{fullName}}</strong></p>
				<p>{{jobTitle}} | {{department}}</p>
				<p>{{email}} | {{workPhone}}</p>
			</div>
		`,
		groupIds: ["engineering", "product", "all-employees"],
		organizationalUnitPaths: ["/", "/Engineering", "/Product"],
		jobTitle: "Product Manager",
		department: "Product",
		organization: "Example Corp",
		location: "San Francisco, CA",
		employeeId: "E-10428",
		address: "123 Market Street, San Francisco, CA 94105",
		costCenter: "CC-4400",
		companyDescription: "Example Corp builds workplace software.",
		managerEmail: "sam.lee@example.com",
		buildingId: "SFO-4",
		floorName: "7",
		floorSection: "West",
		deskCode: "7W-18",
		website: "https://example.com/jane",
		workWebsite: "https://example.com",
		profileUrl: "https://example.com/people/jane-doe",
		phoneNumbers: [
			{ type: "mobile", number: "+1-555-123-4567" },
			{ type: "work", number: "+1-555-987-6543" },
			{ type: "home", number: "+1-555-222-3344" },
		],
	},
	{
		...emptyDirectoryProfile(),
		email: "sam.lee@example.com",
		displayName: "Sam Lee",
		givenName: "Sam",
		familyName: "Lee",
		signatureHtml: `
			<div>
				<p><strong>{{fullName}}</strong></p>
				<p>{{jobTitle}}</p>
				<p>{{email}}</p>
			</div>
		`,
		groupIds: ["sales", "all-employees"],
		organizationalUnitPaths: ["/", "/Sales", "/Sales/West"],
		jobTitle: "Sales Director",
		department: "Sales",
		organization: "Example Corp",
	},
	{
		...emptyDirectoryProfile(),
		email: "alex.kim@example.com",
		displayName: "Alex Kim",
		givenName: "Alex",
		familyName: "Kim",
		signatureHtml: `
			<div>
				<p>{{fullName}}</p>
				<p>{{email}} | {{mobile}}</p>
			</div>
		`,
		groupIds: ["engineering", "all-employees"],
		organizationalUnitPaths: ["/", "/Engineering", "/Engineering/Platform"],
		jobTitle: "Software Engineer",
		department: "Engineering",
		organization: "Example Corp",
		phoneNumbers: [{ type: "mobile", number: "+1-555-111-2222" }],
	},
	{
		...emptyDirectoryProfile(),
		email: "morgan.patel@example.com",
		displayName: "Morgan Patel",
		givenName: "Morgan",
		familyName: "Patel",
		signatureHtml: `
			<div>
				<p><strong>{{fullName}}</strong> | {{jobTitle}}</p>
				<p>{{company}}</p>
				<p>{{email}}</p>
			</div>
		`,
		groupIds: ["marketing", "all-employees"],
		organizationalUnitPaths: ["/", "/Marketing"],
		jobTitle: "Marketing Lead",
		department: "Marketing",
		organization: "Example Corp",
	},
]

function fixtureGroupMembers(groupId: string): DirectoryGroupMember[] {
	return directoryUsers
		.filter((user) => user.groupIds.includes(groupId))
		.map((user) => ({
			email: user.email,
			role: directoryGroupMemberRoles.member,
		}))
}

export const directoryGroups: DirectoryGroup[] = [
	{
		id: "engineering",
		name: "Engineering",
		email: "engineering@example.com",
		description: "",
		members: fixtureGroupMembers("engineering"),
	},
	{
		id: "all-employees",
		name: "All Employees",
		email: "everyone@example.com",
		description: "",
		members: fixtureGroupMembers("all-employees"),
	},
	{
		id: "marketing",
		name: "Marketing",
		email: "marketing@example.com",
		description: "",
		members: fixtureGroupMembers("marketing"),
	},
	{
		id: "sales",
		name: "Sales",
		email: "sales@example.com",
		description: "",
		members: fixtureGroupMembers("sales"),
	},
	{
		id: "product",
		name: "Product",
		email: "product@example.com",
		description: "",
		members: fixtureGroupMembers("product"),
	},
]

export const directoryOrganizationalUnits: DirectoryOrganizationalUnit[] = [
	{ path: "/", name: "Example Corp" },
	{ path: "/Engineering", name: "Engineering" },
	{ path: "/Engineering/Platform", name: "Platform" },
	{ path: "/Sales", name: "Sales" },
	{ path: "/Sales/West", name: "West" },
	{ path: "/Marketing", name: "Marketing" },
	{ path: "/Product", name: "Product" },
]

export function findDirectoryUser(email: string): DirectoryUser | undefined {
	return directoryUsers.find((user) => user.email === email)
}

export function findDirectoryGroup(groupId: string): DirectoryGroup | undefined {
	return directoryGroups.find((group) => group.id === groupId)
}

export function findDirectoryOrganizationalUnit(path: string): DirectoryOrganizationalUnit | undefined {
	return directoryOrganizationalUnits.find((unit) => unit.path === path)
}

export function groupIdFromAssignedGroup(
	assignedGroup: string | null | undefined,
	groups: DirectoryGroup[] = directoryGroups,
): string | null {
	if(!assignedGroup) return null
	const normalizedName = assignedGroup.trim().toLowerCase()
	const match = groups.find((group) => group.name.toLowerCase() === normalizedName)
	return match?.id ?? null
}

export function resolveTargetEmails(
	input: {
		userEmails: string[]
		groupIds: string[]
		organizationalUnitPaths: string[]
	},
	users: DirectoryUser[] = directoryUsers,
): string[] {
	const emails = new Set<string>()

	for(const email of input.userEmails) {
		emails.add(email)
	}

	for(const groupId of input.groupIds) {
		for(const user of users) {
			if(user.groupIds.includes(groupId)) {
				emails.add(user.email)
			}
		}
	}

	for(const organizationalUnitPath of input.organizationalUnitPaths) {
		for(const user of users) {
			if(user.organizationalUnitPaths.includes(organizationalUnitPath)) {
				emails.add(user.email)
			}
		}
	}

	return [...emails].sort()
}
