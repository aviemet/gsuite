export interface DirectoryUser {
	email: string
	displayName: string
	signatureHtml: string
	groupIds: string[]
	organizationalUnitPaths: string[]
}

export interface DirectoryGroup {
	id: string
	name: string
	email: string
}

export interface DirectoryOrganizationalUnit {
	path: string
	name: string
}

export const directoryUsers: DirectoryUser[] = [
	{
		email: "jane.doe@example.com",
		displayName: "Jane Doe",
		signatureHtml: `
			<div>
				<p><strong>{{fullName}}</strong></p>
				<p>{{jobTitle}} | {{department}}</p>
				<p>{{email}} | {{workPhone}}</p>
			</div>
		`,
		groupIds: ["engineering", "product", "all-employees"],
		organizationalUnitPaths: ["/", "/Engineering", "/Product"],
	},
	{
		email: "sam.lee@example.com",
		displayName: "Sam Lee",
		signatureHtml: `
			<div>
				<p><strong>{{fullName}}</strong></p>
				<p>{{jobTitle}}</p>
				<p>{{email}}</p>
			</div>
		`,
		groupIds: ["sales", "all-employees"],
		organizationalUnitPaths: ["/", "/Sales", "/Sales/West"],
	},
	{
		email: "alex.kim@example.com",
		displayName: "Alex Kim",
		signatureHtml: `
			<div>
				<p>{{fullName}}</p>
				<p>{{email}} | {{mobile}}</p>
			</div>
		`,
		groupIds: ["engineering", "all-employees"],
		organizationalUnitPaths: ["/", "/Engineering", "/Engineering/Platform"],
	},
	{
		email: "morgan.patel@example.com",
		displayName: "Morgan Patel",
		signatureHtml: `
			<div>
				<p><strong>{{fullName}}</strong> | {{jobTitle}}</p>
				<p>{{company}}</p>
				<p>{{email}}</p>
			</div>
		`,
		groupIds: ["marketing", "all-employees"],
		organizationalUnitPaths: ["/", "/Marketing"],
	},
]

export const directoryGroups: DirectoryGroup[] = [
	{ id: "engineering", name: "Engineering", email: "engineering@example.com" },
	{ id: "all-employees", name: "All Employees", email: "everyone@example.com" },
	{ id: "marketing", name: "Marketing", email: "marketing@example.com" },
	{ id: "sales", name: "Sales", email: "sales@example.com" },
	{ id: "product", name: "Product", email: "product@example.com" },
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
