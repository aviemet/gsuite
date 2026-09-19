export interface DirectoryUser {
	email: string
	displayName: string
	signatureHtml: string
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

export const directoryUserSelectData = directoryUsers.map((user) => ({
	value: user.email,
	label: `${user.displayName} (${user.email})`,
}))

export const directoryGroupSelectData = directoryGroups.map((group) => ({
	value: group.id,
	label: group.name,
}))

export const directoryOrganizationalUnitSelectData = directoryOrganizationalUnits.map((unit) => ({
	value: unit.path,
	label: unit.path === "/" ? unit.name : `${unit.path} (${unit.name})`,
}))

export function findDirectoryUser(email: string): DirectoryUser | undefined {
	return directoryUsers.find((user) => user.email === email)
}

export function findDirectoryGroup(groupId: string): DirectoryGroup | undefined {
	return directoryGroups.find((group) => group.id === groupId)
}

export function findDirectoryOrganizationalUnit(path: string): DirectoryOrganizationalUnit | undefined {
	return directoryOrganizationalUnits.find((unit) => unit.path === path)
}

export function groupIdFromAssignedGroup(assignedGroup: string | null | undefined): string | null {
	if(!assignedGroup) return null
	const normalizedName = assignedGroup.trim().toLowerCase()
	const match = directoryGroups.find((group) => group.name.toLowerCase() === normalizedName)
	return match?.id ?? null
}
