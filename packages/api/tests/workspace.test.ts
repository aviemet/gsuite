import {
	ACCESS_COLLECTION,
	CUSTOMERS_COLLECTION,
	membershipRoles,
	MEMBERSHIPS_COLLECTION,
} from "@gsuite/shared"
import { describe, expect, it } from "vitest"

import { type DirectoryClient } from "../src/directory/client"
import { type GmailClient } from "../src/gmail/client"
import { removeAccess, setAccess } from "../src/workspace/access"
import { checkApiStatus } from "../src/workspace/apiStatus"
import { connectWorkspace, setWorkspaceAdmin } from "../src/workspace/connect"
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

const superAdmin: AuthorizedMember = {
	uid: "owner-1",
	email: "owner@example.com",
	customerId: "customer-1",
	role: membershipRoles.superAdmin,
	primaryDomain: "example.com",
	workspaceAdminEmail: "admin@example.com",
}

describe("connectWorkspace", () => {
	it("creates a customer and a super admin membership", async () => {
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
			role: membershipRoles.superAdmin,
			email: "owner@example.com",
		})
		expect(database.documents.get(`${ACCESS_COLLECTION}/owner@example.com`)).toMatchObject({
			customerId: "customer-1",
			role: membershipRoles.superAdmin,
			uid: "user-1",
		})
	})

	it("rejects an account that is not a Workspace super admin", async () => {
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
	it("stores a Workspace super admin from the same domain", async () => {
		const database = createMemoryFirestore()
		database.documents.set(`${CUSTOMERS_COLLECTION}/customer-1`, {
			id: "customer-1",
			primaryDomain: "example.com",
			workspaceAdminEmail: "admin@example.com",
			createdAt: "2026-01-01T00:00:00.000Z",
			updatedAt: "2026-01-01T00:00:00.000Z",
		})

		const customer = await setWorkspaceAdmin(database as never, superAdmin, "jane.doe@example.com", {
			createDirectory: () => directoryWith({
				"jane.doe@example.com": { isAdmin: true, primaryDomain: "example.com" },
			}),
			now: () => new Date("2026-02-01T00:00:00.000Z"),
		})

		expect(customer.workspaceAdminEmail).toBe("jane.doe@example.com")
	})

	it("rejects a non super admin site role", async () => {
		const database = createMemoryFirestore()
		await expect(setWorkspaceAdmin(
			database as never,
			{ ...superAdmin, role: membershipRoles.admin },
			"jane.doe@example.com",
			{ createDirectory: () => directoryWith({}) },
		)).rejects.toThrow("Super admin access required")
	})
})

describe("access", () => {
	it("grants a Directory user a role", async () => {
		const database = createMemoryFirestore()
		database.documents.set(`${ACCESS_COLLECTION}/owner@example.com`, {
			email: "owner@example.com",
			customerId: "customer-1",
			role: membershipRoles.superAdmin,
			createdAt: "2026-01-01T00:00:00.000Z",
			uid: "owner-1",
		})

		const access = await setAccess(
			database as never,
			superAdmin,
			"Editor@example.com",
			membershipRoles.editor,
			() => new Date("2026-01-01T00:00:00.000Z"),
		)

		expect(access).toMatchObject({
			email: "editor@example.com",
			role: membershipRoles.editor,
		})
		expect(database.documents.get(`${ACCESS_COLLECTION}/editor@example.com`)).toMatchObject({
			customerId: "customer-1",
			role: membershipRoles.editor,
		})
	})

	it("removes access and keeps at least one super admin", async () => {
		const database = createMemoryFirestore()
		database.documents.set(`${ACCESS_COLLECTION}/owner@example.com`, {
			email: "owner@example.com",
			customerId: "customer-1",
			role: membershipRoles.superAdmin,
			createdAt: "2026-01-01T00:00:00.000Z",
			uid: "owner-1",
		})
		database.documents.set(`${ACCESS_COLLECTION}/editor@example.com`, {
			email: "editor@example.com",
			customerId: "customer-1",
			role: membershipRoles.editor,
			createdAt: "2026-01-01T00:00:00.000Z",
			uid: "editor-1",
		})
		database.documents.set(`${MEMBERSHIPS_COLLECTION}/editor-1`, {
			uid: "editor-1",
			customerId: "customer-1",
			role: membershipRoles.editor,
			email: "editor@example.com",
			createdAt: "2026-01-01T00:00:00.000Z",
		})

		await removeAccess(database as never, superAdmin, "editor@example.com")
		expect(database.documents.has(`${ACCESS_COLLECTION}/editor@example.com`)).toBe(false)
		expect(database.documents.has(`${MEMBERSHIPS_COLLECTION}/editor-1`)).toBe(false)

		await expect(removeAccess(database as never, superAdmin, "owner@example.com")).rejects.toThrow(
			"Keep at least one super admin",
		)
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
