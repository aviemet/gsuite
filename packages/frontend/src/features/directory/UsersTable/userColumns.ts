import { type TableColumnDefinition } from "@/frontend/lib/tableView"

import { type DirectoryUserRow } from "./sortDirectoryUsers"

export const DIRECTORY_USERS_VIEW_ID = "directory.users"

export const userColumns: TableColumnDefinition<DirectoryUserRow>[] = [
	{
		id: "displayName",
		label: "Name",
		defaultVisible: true,
		getValue: (row) => row.displayName,
	},
	{
		id: "email",
		label: "Email",
		defaultVisible: true,
		getValue: (row) => row.email,
	},
	{
		id: "jobTitle",
		label: "Job title",
		defaultVisible: true,
		getValue: (row) => row.jobTitle,
	},
	{
		id: "department",
		label: "Department",
		defaultVisible: true,
		getValue: (row) => row.department,
	},
	{
		id: "organizationalUnit",
		label: "OU",
		defaultVisible: true,
		getValue: (row) => row.organizationalUnit,
	},
	{
		id: "groupCount",
		label: "Groups",
		defaultVisible: true,
		getValue: (row) => row.groupCount,
	},
	{
		id: "givenName",
		label: "Given name",
		defaultVisible: false,
		getValue: (row) => row.givenName,
	},
	{
		id: "familyName",
		label: "Family name",
		defaultVisible: false,
		getValue: (row) => row.familyName,
	},
	{
		id: "organization",
		label: "Organization",
		defaultVisible: false,
		getValue: (row) => row.organization,
	},
	{
		id: "location",
		label: "Location",
		defaultVisible: false,
		getValue: (row) => row.location,
	},
	{
		id: "employeeId",
		label: "Employee ID",
		defaultVisible: false,
		getValue: (row) => row.employeeId,
	},
	{
		id: "managerEmail",
		label: "Manager",
		defaultVisible: false,
		getValue: (row) => row.managerEmail,
	},
	{
		id: "workPhone",
		label: "Work phone",
		defaultVisible: false,
		getValue: (row) => row.workPhone,
	},
]
