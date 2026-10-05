import { type DirectoryUser, type Person, samplePerson } from "@gsuite/shared"

function personFromDirectoryUser(email: string, displayName: string): Person {
	const [firstName = displayName, ...rest] = displayName.split(" ")
	const lastName = rest.join(" ")

	return {
		...samplePerson,
		id: email,
		firstName,
		lastName,
		displayName,
		primaryEmail: email,
	}
}

export function getPersonForEmail(
	email: string,
	usersByEmail: ReadonlyMap<string, DirectoryUser>,
): Person {
	const directoryUser = usersByEmail.get(email)
	if(directoryUser) {
		return personFromDirectoryUser(directoryUser.email, directoryUser.displayName)
	}
	return personFromDirectoryUser(email, email)
}
