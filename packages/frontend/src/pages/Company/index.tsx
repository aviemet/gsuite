import { Center, Container, Loader, Text } from "@mantine/core"
import { notifications } from "@mantine/notifications"

import { Page } from "@/frontend/components/Page"
import { CompanyForm } from "@/frontend/features/company/CompanyForm"
import { useCompanyQuery, useSaveCompany } from "@/frontend/queries/company"
import { useMembershipQuery } from "@/frontend/queries/templates"
import { type CompanyProfile } from "@/shared/company"
import { canManageAccess } from "@/shared/workspace"

export function CompanyPage() {
	const company = useCompanyQuery()
	const membership = useMembershipQuery()
	const saveCompany = useSaveCompany()
	const canSave = membership.data ? canManageAccess(membership.data.role) : false

	function handleSave(profile: CompanyProfile) {
		saveCompany.mutate(profile, {
			onSuccess: () => {
				notifications.show({ color: "green", message: "Company saved" })
			},
			onError: (error) => {
				notifications.show({ color: "red", message: error.message })
			},
		})
	}

	if(company.isError) {
		return (
			<Page title="Company">
				<Container size="md">
					<Text c="red">Error loading company: { company.error.message }</Text>
				</Container>
			</Page>
		)
	}

	if(!company.data) {
		return (
			<Page title="Company">
				<Center mih="12rem">
					<Loader />
				</Center>
			</Page>
		)
	}

	return (
		<Page title="Company">
			<Container size="md">
				<CompanyForm
					key={ company.data.updatedAt }
					profile={ company.data }
					canSave={ canSave }
					isSaving={ saveCompany.isPending }
					onSave={ handleSave }
				/>
			</Container>
		</Page>
	)
}
