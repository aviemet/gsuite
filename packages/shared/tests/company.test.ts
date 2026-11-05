import { describe, expect, it } from "vitest"

import {
	companyDepartmentNames,
	normalizeCompanyProfile,
	readCompanyProfile,
	readCompanyRecord,
} from "../src/company"

const createId = () => "generated-id"

describe("normalizeCompanyProfile", () => {
	it("trims values and drops blank rows", () => {
		expect(normalizeCompanyProfile({
			name: "  Northwind  ",
			phones: [
				{ id: "blank", label: " ", number: " " },
				{ id: "main", label: " Main ", number: " 415-555-0100 " },
			],
			addresses: [
				{ id: "blank", label: "", formatted: " " },
				{ id: "hq", label: " HQ ", formatted: " 1 Market St " },
			],
			departments: [
				{ id: "blank", name: " " },
				{ id: "sales", name: " Sales " },
			],
		})).toEqual({
			name: "Northwind",
			phones: [{ id: "main", label: "Main", number: "415-555-0100" }],
			addresses: [{ id: "hq", label: "HQ", formatted: "1 Market St" }],
			departments: [{ id: "sales", name: "Sales" }],
		})
	})

	it("rejects a phone label without a number", () => {
		expect(() => normalizeCompanyProfile({
			name: "Northwind",
			phones: [{ id: "main", label: "Main", number: " " }],
			addresses: [],
			departments: [],
		})).toThrow("Phone number is required")
	})

	it("rejects an address label without an address", () => {
		expect(() => normalizeCompanyProfile({
			name: "Northwind",
			phones: [],
			addresses: [{ id: "hq", label: "HQ", formatted: "" }],
			departments: [],
		})).toThrow("Address is required")
	})

	it("rejects duplicate department names", () => {
		expect(() => normalizeCompanyProfile({
			name: "Northwind",
			phones: [],
			addresses: [],
			departments: [
				{ id: "one", name: "Sales" },
				{ id: "two", name: "sales" },
			],
		})).toThrow('Department "sales" is listed more than once')
	})
})

describe("readCompanyProfile", () => {
	it("assigns an id when a row does not have one", () => {
		expect(readCompanyProfile({
			name: "Northwind",
			phones: [{ label: "Main", number: "415" }],
			addresses: [],
			departments: [{ name: "Sales" }],
		}, createId)).toEqual({
			name: "Northwind",
			phones: [{ id: "generated-id", label: "Main", number: "415" }],
			addresses: [],
			departments: [{ id: "generated-id", name: "Sales" }],
		})
	})

	it("reads the stored customer id and updated time", () => {
		const record = readCompanyRecord({
			customerId: "customer-1",
			updatedAt: "2026-01-01T00:00:00.000Z",
			name: "Northwind",
			phones: [],
			addresses: [],
			departments: [{ id: "sales", name: "Sales" }],
		}, createId)

		expect(record.customerId).toBe("customer-1")
		expect(record.updatedAt).toBe("2026-01-01T00:00:00.000Z")
		expect(companyDepartmentNames(record.departments)).toEqual(["Sales"])
	})

	it("rejects a profile that is not an object", () => {
		expect(() => readCompanyProfile([], createId)).toThrow("Invalid company")
	})
})
