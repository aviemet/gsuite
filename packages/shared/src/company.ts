export const COMPANIES_COLLECTION = "companies"

const NAME_LIMIT = 200
const LABEL_LIMIT = 80
const PHONE_LIMIT = 40
const ADDRESS_LIMIT = 500
const DEPARTMENT_LIMIT = 80
const LIST_LIMIT = 100

export interface CompanyPhone {
	id: string
	label: string
	number: string
}

export interface CompanyAddress {
	id: string
	label: string
	formatted: string
}

export interface CompanyDepartment {
	id: string
	name: string
}

export interface CompanyProfile {
	name: string
	phones: CompanyPhone[]
	addresses: CompanyAddress[]
	departments: CompanyDepartment[]
}

export interface CompanyRecord extends CompanyProfile {
	customerId: string
	updatedAt: string
}

export function emptyCompanyProfile(): CompanyProfile {
	return {
		name: "",
		phones: [],
		addresses: [],
		departments: [],
	}
}

export function companyDepartmentNames(departments: readonly CompanyDepartment[]): string[] {
	return departments.map((department) => department.name)
}

function asObject(value: unknown): object | undefined {
	if(!value || typeof value !== "object" || Array.isArray(value)) return undefined
	return value
}

function readString(value: object, key: string): string {
	if(!Object.hasOwn(value, key)) return ""
	const field = Reflect.get(value, key)
	return typeof field === "string" ? field : ""
}

function readObjectList(value: object, key: string): object[] {
	if(!Object.hasOwn(value, key)) return []
	const field = Reflect.get(value, key)
	if(!Array.isArray(field)) throw new Error(`Invalid ${ key }`)
	return field.map((entry) => {
		if(!entry || typeof entry !== "object" || Array.isArray(entry)) {
			throw new Error(`Invalid ${ key }`)
		}
		return entry
	})
}

function requireId(id: string): string {
	const trimmed = id.trim()
	if(!trimmed) throw new Error("Missing id")
	return trimmed
}

function normalizePhones(phones: readonly CompanyPhone[]): CompanyPhone[] {
	const normalized = phones.flatMap((phone) => {
		const label = phone.label.trim()
		const number = phone.number.trim()
		if(!label && !number) return []
		if(!number) throw new Error("Phone number is required")
		if(label.length > LABEL_LIMIT) throw new Error("Phone label is too long")
		if(number.length > PHONE_LIMIT) throw new Error("Phone number is too long")
		return [{ id: requireId(phone.id), label, number }]
	})
	if(normalized.length > LIST_LIMIT) throw new Error("Too many phone numbers")
	return normalized
}

function normalizeAddresses(addresses: readonly CompanyAddress[]): CompanyAddress[] {
	const normalized = addresses.flatMap((address) => {
		const label = address.label.trim()
		const formatted = address.formatted.trim()
		if(!label && !formatted) return []
		if(!formatted) throw new Error("Address is required")
		if(label.length > LABEL_LIMIT) throw new Error("Address label is too long")
		if(formatted.length > ADDRESS_LIMIT) throw new Error("Address is too long")
		return [{ id: requireId(address.id), label, formatted }]
	})
	if(normalized.length > LIST_LIMIT) throw new Error("Too many addresses")
	return normalized
}

function normalizeDepartments(departments: readonly CompanyDepartment[]): CompanyDepartment[] {
	const normalized = departments.flatMap((department) => {
		const name = department.name.trim()
		if(!name) return []
		if(name.length > DEPARTMENT_LIMIT) throw new Error("Department name is too long")
		return [{ id: requireId(department.id), name }]
	})
	if(normalized.length > LIST_LIMIT) throw new Error("Too many departments")
	const seen = new Set<string>()
	for(const department of normalized) {
		const key = department.name.toLocaleLowerCase()
		if(seen.has(key)) {
			throw new Error(`Department "${ department.name }" is listed more than once`)
		}
		seen.add(key)
	}
	return normalized
}

export function normalizeCompanyProfile(profile: CompanyProfile): CompanyProfile {
	const name = profile.name.trim()
	if(name.length > NAME_LIMIT) throw new Error("Company name is too long")
	return {
		name,
		phones: normalizePhones(profile.phones),
		addresses: normalizeAddresses(profile.addresses),
		departments: normalizeDepartments(profile.departments),
	}
}

export function readCompanyProfile(value: unknown, createId: () => string): CompanyProfile {
	const data = asObject(value)
	if(!data) throw new Error("Invalid company")
	return normalizeCompanyProfile({
		name: readString(data, "name"),
		phones: readObjectList(data, "phones").map((row) => ({
			id: readString(row, "id").trim() || createId(),
			label: readString(row, "label"),
			number: readString(row, "number"),
		})),
		addresses: readObjectList(data, "addresses").map((row) => ({
			id: readString(row, "id").trim() || createId(),
			label: readString(row, "label"),
			formatted: readString(row, "formatted"),
		})),
		departments: readObjectList(data, "departments").map((row) => ({
			id: readString(row, "id").trim() || createId(),
			name: readString(row, "name"),
		})),
	})
}

export function readCompanyRecord(value: unknown, createId: () => string): CompanyRecord {
	const data = asObject(value)
	if(!data) throw new Error("Invalid company")
	return {
		...readCompanyProfile(value, createId),
		customerId: readString(data, "customerId"),
		updatedAt: readString(data, "updatedAt"),
	}
}
