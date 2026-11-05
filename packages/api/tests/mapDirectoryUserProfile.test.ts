import { describe, expect, it } from "vitest"

import { mapDirectoryUserProfile } from "../src/directory/mapDirectoryUserProfile"

describe("mapDirectoryUserProfile", () => {
	it("reads title and phones from the Google Directory user payload", () => {
		const profile = mapDirectoryUserProfile({
			primaryEmail: "avram@thebatterysf.com",
			name: { fullName: "Avram Walden", givenName: "Avram", familyName: "Walden" },
			organizations: [{
				primary: true,
				title: "Engineering Manager",
				department: "IT",
				name: "The Battery",
			}],
			phones: [
				{ type: "work", value: "+1-415-555-0100" },
				{ type: "mobile", value: "+1-415-555-0199" },
			],
		})

		expect(profile.givenName).toBe("Avram")
		expect(profile.jobTitle).toBe("Engineering Manager")
		expect(profile.department).toBe("IT")
		expect(profile.organization).toBe("The Battery")
		expect(profile.phoneNumbers).toEqual([
			{ type: "work", number: "+1-415-555-0100" },
			{ type: "mobile", number: "+1-415-555-0199" },
		])
		expect(profile.accountStatus).toBe("Active")
	})

	it("reads suspended and archived ahead of the active status", () => {
		expect(mapDirectoryUserProfile({ suspended: true }).accountStatus).toBe("Suspended")
		expect(mapDirectoryUserProfile({ archived: true, suspended: true }).accountStatus).toBe("Archived")
	})

	it("returns empty strings when Directory has no organization or phones", () => {
		const profile = mapDirectoryUserProfile({
			primaryEmail: "avram@thebatterysf.com",
			name: { fullName: "Avram Walden" },
		})

		expect(profile.jobTitle).toBe("")
		expect(profile.phoneNumbers).toEqual([])
	})
})
