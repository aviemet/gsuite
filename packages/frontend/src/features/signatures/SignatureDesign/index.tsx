import { Alert, Center, Loader } from "@mantine/core"

import { useDirectoryQuery } from "@/frontend/queries/directory"
import { useTemplatesQuery } from "@/frontend/queries/templates"
import { type Template } from "@/frontend/types/firebase"

import { SignatureDesignForm } from "./SignatureDesignForm"

interface SignatureDesignProps {
	template?: Template
	onSubmit: (values: { name: string, content: string }) => void | Promise<void>
	onCancel: () => void
	isSubmitting?: boolean
}

export function SignatureDesign({
	template,
	onSubmit,
	onCancel,
	isSubmitting = false,
}: SignatureDesignProps) {
	const { data: templates = [] } = useTemplatesQuery()
	const {
		data: directory,
		isLoading: isDirectoryLoading,
		error: directoryError,
	} = useDirectoryQuery({ enabled: !template })

	if(!template && isDirectoryLoading) {
		return (
			<Center mih="12rem">
				<Loader />
			</Center>
		)
	}

	if(!template && (directoryError || !directory)) {
		return (
			<Alert color="red" title="Directory unavailable">
				{ directoryError instanceof Error
					? directoryError.message
					: "Failed to load Workspace directory" }
			</Alert>
		)
	}

	return (
		<SignatureDesignForm
			template={ template }
			templates={ templates }
			directory={ directory }
			onSubmit={ onSubmit }
			onCancel={ onCancel }
			isSubmitting={ isSubmitting }
		/>
	)
}
