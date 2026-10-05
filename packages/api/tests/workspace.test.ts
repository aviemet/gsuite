import {
	CUSTOMERS_COLLECTION,
	INVITES_COLLECTION,
	membershipRoles,
	MEMBERSHIPS_COLLECTION,
} from "@gsuite/shared"
import { describe, expect, it } from "vitest"

import { type DirectoryClient } from "../src/directory/client"
import { type GmailClient } from "../src/gmail/client"
import { checkApiStatus } from "../src/workspace/apiStatus"
import { connectWorkspace, setWorkspaceAdmin } from "../src/workspace/connect"
import { acceptInvite, inviteMember, removeMember } from "../src/workspace/invites"
import { type AuthorizedMember } from "../src/workspace/records"

function createMemoryFirestore() {
	const documents = new Map<string, Record<string, unknown>>()

	function documentApi(path: string) {
		const segments = path.split("/")
		const id = segments[segments.length - 1] ?? ""
		return {
			id,
			path,
			parent: {
				parent: segments.length >= 4
					? { id: segments[segments.length - 3] ?? "" }
					: null,
			},
			async get() {
				const data = documents.get(path)
				return {
					exists: documents.has(path),
					id,
					data: () => data,
				}
			},
			async set(value: Record<string, unknown>) {
				documents.set(path, value)
			},
			async delete() {
				documents.delete(path)
			},
			collection(name: string) {
				return collectionApi(`${path}/${name}`)
			},
		}
	}

	function matchingDocuments(collectionPath: string, field: string, value: unknown, limitCount?: number) {
		const matches = [...documents.entries()].filter(([path, data]) => {
			if(!path.startsWith(`${collectionPath}/`)) return false
			if(path.slice(collectionPath.length + 1).includes("/")) return false
			return data[field] === value
		})
		return typeof limitCount === "number" ? matches.slice(0, limitCount) : matches
	}

	function collectionApi(collectionPath: string) {
		function query(field?: string, value?: unknown) {
			let limitCount: number | undefined
			return {
				limit(count: number) {
					limitCount = count
					return this
				},
				async get() {
					const matches = field === undefined
						? [...documents.entries()].filter(([path]) => {
							return path.startsWith(`${collectionPath}/`) && !path.slice(collectionPath.length + 1).includes("/")
						})
						: matchingDocuments(collectionPath, field, value, limitCount)
					return {
						docs: matches.map(([path, data]) => ({
							id: path.split("/").pop() ?? "",
							ref: documentApi(path),
							data: () => data,
						})),
					}
				},
			}
		}

		return {
			doc(id: string) {
				return documentApi(`${collectionPath}/${id}`)
			},
			where(field: string, _operator: string, value: unknown) {
				return query(field, value)
			},
			get() {
				return query().get()
			},
		}
	}

	return {
		documents,
		collection: collectionApi,
		collectionGroup(groupId: string) {
			return {
				where(field: string, _operator: string, value: unknown) {
					let limitCount: number | undefined
					return {
						limit(count: number) {
							limitCount = count
							return this
						},
						async get() {
							const matches = [...documents.entries()].filter(([path, data]) => {
								const segments = path.split("/")
								return segments[segments.length - 2] === groupId && data[field] === value
							})
							const limited = typeof limitCount === "number" ? matches.slice(0, limitCount) : matches
							return {
								docs: limited.map(([path, data]) => ({
									id: path.split("/").pop() ?? "",
									ref: documentApi(path),
									data: () => data,
								})),
							}
						},
					}
				},
			}
		},
		batch() {
			const operations: Array<() => void> = []
			return {
				set(ref: { path: string }, value: Record<string, unknown>) {
					operations.push(() => {
						documents.set(ref.path, value)
					})
				},
				delete(ref: { path: string }) {
					operations.push(() => {
						documents.delete(ref.path)
					})
				},
				async commit() {
					for(const operation of operations) operation()
				},
			}
		},
	}
}

function directoryWith(accounts: Record<string, { isAdmin: boolean, primaryDomain: string }>): DirectoryClient {
	return {
		async listDirectory() {
			return { users: [], groups: [], organizationalUnits: [] }
		},
		async getUser(email) {
			const account = accounts[email]
			if(!account) return undefined
			return {
				email,
				displayName: email,
				isAdmin: account.isAdmin,
				primaryDomain: account.primaryDomain,
			}
		},
		async checkUsers() {},
		async checkGroups() {},
		async checkOrganizationalUnits() {},
	}
}

const owner: AuthorizedMember = {
	uid: "owner-1",
	email: "owner@example.com",
	customerId: "customer-1",
	role: membershipRoles.owner,
	primaryDomain: "example.com",
	workspaceAdminEmail: "admin@example.com",
}

describe("connectWorkspace", () => {
	it("creates a customer and an owner membership for a super admin", async () => {
		const database = createMemoryFirestore()
		const customer = await connectWorkspace(
			database as never,
			{ uid: "user-1", email: "owner@example.com" },
			"Admin@example.com",
			{
				createDirectory: () => directoryWith({
					"admin@example.com": { isAdmin: true, primaryDomain: "example.com" },
				}),
				now: () => new Date("2026-01-01T00:00:00.000Z"),
				createId: () => "customer-1",
			},
		)

		expect(customer).toMatchObject({
			id: "customer-1",
			primaryDomain: "example.com",
			workspaceAdminEmail: "admin@example.com",
		})
		expect(database.documents.get(`${MEMBERSHIPS_COLLECTION}/user-1`)).toMatchObject({
			customerId: "customer-1",
			role: membershipRoles.owner,
			email: "owner@example.com",
		})
	})

	it("rejects an account that is not a super admin", async () => {
		const database = createMemoryFirestore()
		await expect(connectWorkspace(
			database as never,
			{ uid: "user-1", email: "owner@example.com" },
			"sam.lee@example.com",
			{
				createDirectory: () => directoryWith({
					"sam.lee@example.com": { isAdmin: false, primaryDomain: "example.com" },
				}),
			},
		)).rejects.toThrow("Workspace admin must be a super admin")
	})

	it("rejects a domain that is already connected", async () => {
		const database = createMemoryFirestore()
		database.documents.set(`${CUSTOMERS_COLLECTION}/existing`, {
			id: "existing",
			primaryDomain: "example.com",
			workspaceAdminEmail: "admin@example.com",
			createdAt: "2026-01-01T00:00:00.000Z",
			updatedAt: "2026-01-01T00:00:00.000Z",
		})

		await expect(connectWorkspace(
			database as never,
			{ uid: "user-2", email: "other@example.com" },
			"admin@example.com",
			{
				createDirectory: () => directoryWith({
					"admin@example.com": { isAdmin: true, primaryDomain: "example.com" },
				}),
			},
		)).rejects.toThrow("This Workspace domain is already connected")
	})
})

describe("setWorkspaceAdmin", () => {
	it("stores a super admin from the same domain", async () => {
		const database = createMemoryFirestore()
		database.documents.set(`${CUSTOMERS_COLLECTION}/customer-1`, {
			id: "customer-1",
			primaryDomain: "example.com",
			workspaceAdminEmail: "admin@example.com",
			createdAt: "2026-01-01T00:00:00.000Z",
			updatedAt: "2026-01-01T00:00:00.000Z",
		})

		const customer = await setWorkspaceAdmin(database as never, owner, "jane.doe@example.com", {
			createDirectory: () => directoryWith({
				"jane.doe@example.com": { isAdmin: true, primaryDomain: "example.com" },
			}),
			now: () => new Date("2026-02-01T00:00:00.000Z"),
		})

		expect(customer.workspaceAdminEmail).toBe("jane.doe@example.com")
	})

	it("rejects a member", async () => {
		const database = createMemoryFirestore()
		await expect(setWorkspaceAdmin(
			database as never,
			{ ...owner, role: membershipRoles.member },
			"jane.doe@example.com",
			{ createDirectory: () => directoryWith({}) },
		)).rejects.toThrow("Owner access required")
	})
})

describe("invites", () => {
	it("lets the invited account join the customer", async () => {
		const database = createMemoryFirestore()
		await inviteMember(database as never, owner, "Member@example.com", () => new Date("2026-01-01T00:00:00.000Z"))
		expect(database.documents.has(`${CUSTOMERS_COLLECTION}/customer-1/${INVITES_COLLECTION}/member@example.com`)).toBe(true)

		const membership = await acceptInvite(
			database as never,
			{ uid: "member-1", email: "member@example.com" },
			() => new Date("2026-01-02T00:00:00.000Z"),
		)

		expect(membership).toMatchObject({
			uid: "member-1",
			customerId: "customer-1",
			role: membershipRoles.member,
		})
		expect(database.documents.has(`${CUSTOMERS_COLLECTION}/customer-1/${INVITES_COLLECTION}/member@example.com`)).toBe(false)
	})

	it("removes a member and keeps the owner", async () => {
		const database = createMemoryFirestore()
		database.documents.set(`${MEMBERSHIPS_COLLECTION}/member-1`, {
			uid: "member-1",
			customerId: "customer-1",
			role: membershipRoles.member,
			email: "member@example.com",
			createdAt: "2026-01-01T00:00:00.000Z",
		})

		await removeMember(database as never, owner, "member-1")
		expect(database.documents.has(`${MEMBERSHIPS_COLLECTION}/member-1`)).toBe(false)

		await expect(removeMember(database as never, owner, owner.uid)).rejects.toThrow("The owner cannot be removed")
	})
})

describe("checkApiStatus", () => {
	it("reports each API independently", async () => {
		const directory = directoryWith({})
		directory.checkGroups = async () => {
			throw new Error("groups denied")
		}
		const gmail: GmailClient = {
			async updateSignature() {},
			async probeSignatureSettings() {},
		}

		const results = await checkApiStatus(directory, gmail, "jane.doe@example.com")
		expect(results.map((result) => [result.id, result.status])).toEqual([
			["users", "success"],
			["groups", "error"],
			["organizationalUnits", "success"],
			["gmailSettings", "success"],
		])
		expect(results[1]?.error).toBe("groups denied")
	})
})
