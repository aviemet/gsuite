import { COMPANIES_COLLECTION } from "@gsuite/shared"
import { describe, expect, it } from "vitest"

import { parseCompanyProfile } from "../src/company/parseCompanyProfile"
import { readCompany } from "../src/company/readCompany"
import { saveCompany } from "../src/company/saveCompany"
import { HttpError } from "../src/http/errors"

function createFirestore(seed?: Record<string, Record<string, unknown>>) {
	const docs = new Map<string, Record<string, unknown>>(Object.entries(seed ?? {}))
	return {
		docs,
		db: {
			collection(name: string) {
				return {
					doc(id: string) {
						return {
							async get() {
								const data = name === COMPANIES_COLLECTION ? docs.get(id) : undefined
								return {
									exists: data !== undefined,
									data: () => data,
								}
							},
							async set(value: Record<string, unknown>) {
								if(name !== COMPANIES_COLLECTION) return
								docs.set(id, value)
							},
						}
					},
				}
			},
		},
	}
}

describe("parseCompanyProfile", () => {
	it("returns a 400 when a department is listed twice", () => {
		expect.assertions(2)
		try {
			parseCompanyProfile({
				name: "Northwind",
				phones: [],
				addresses: [],
				departments: [
					{ id: "one", name: "Sales" },
					{ id: "two", name: "sales" },
				],
			}, () => "generated")
		} catch (error) {
			expect(error).toBeInstanceOf(HttpError)
			if(error instanceof HttpError) expect(error.status).toBe(400)
		}
	})
})

describe("saveCompany", () => {
	it("stores the profile on the customer and reads it back", async () => {
		const firestore = createFirestore()
		const saved = await saveCompany(
			{
				name: "Northwind",
				phones: [{ id: "main", label: "Main", number: "415" }],
				addresses: [{ id: "hq", label: "HQ", formatted: "1 Market St" }],
				departments: [{ id: "sales", name: "Sales" }],
			},
			{ customerId: "customer-1" },
			{
				db: firestore.db as never,
				now: () => new Date("2026-01-01T00:00:00.000Z"),
			},
		)

		expect(saved.customerId).toBe("customer-1")
		expect(saved.updatedAt).toBe("2026-01-01T00:00:00.000Z")

		const loaded = await readCompany("customer-1", {
			db: firestore.db as never,
			createId: () => "generated",
		})
		expect(loaded).toEqual(saved)
	})

	it("returns an empty profile when the customer has not saved one", async () => {
		const firestore = createFirestore()
		const loaded = await readCompany("customer-1", { db: firestore.db as never })
		expect(loaded).toEqual({
			customerId: "customer-1",
			updatedAt: "",
			name: "",
			phones: [],
			addresses: [],
			departments: [],
		})
	})
})
