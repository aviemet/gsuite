import { Button, Group, Stack, Stepper } from "@mantine/core"
import { useForm } from "@mantine/form"
import { useMediaQuery } from "@mantine/hooks"
import {
	IconCircleCheck,
	IconFilePlus,
	IconPalette,
	IconUsers,
} from "@tabler/icons-react"
import { useState } from "react"

import { SignatureTemplateForm } from "@/frontend/features/signatures/SignatureTemplateForm"
import { formatHtmlWithDirectives } from "@/frontend/lib"
import { useTemplatesQuery } from "@/frontend/queries/templates"
import { Template } from "@/frontend/types/firebase"

import { ConfirmStep } from "./ConfirmStep"
import { SetupStep } from "./SetupStep"
import { TargetsStep } from "./TargetsStep"
import {
	getInitialWizardValues,
	LAST_WIZARD_STEP,
	type SignatureWizardValues,
} from "./types"

interface SignatureWizardProps {
	template?: Template
	onSubmit: (values: SignatureWizardValues) => void
	onCancel: () => void
}

export function SignatureWizard({
	template,
	onSubmit,
	onCancel,
}: SignatureWizardProps) {
	const isNarrow = useMediaQuery("(max-width: 48em)")
	const { data: templates = [] } = useTemplatesQuery()
	const form = useForm<SignatureWizardValues>({
		initialValues: getInitialWizardValues(template),
	})
	const [activeStep, setActiveStep] = useState(template ? 1 : 0)
	const [highestStepVisited, setHighestStepVisited] = useState(template ? 1 : 0)

	function hasTargetSelection(values: SignatureWizardValues) {
		return values.userEmails.length > 0
			|| values.groupIds.length > 0
			|| values.organizationalUnitPaths.length > 0
	}

	function validateCurrentStep() {
		const { values } = form

		if(activeStep === 0) {
			if(!values.setupSource) {
				form.setFieldError("setupSource", "Choose how to start")
				return false
			}

			if(values.setupSource === "template" && !values.sourceTemplateId) {
				form.setFieldError("sourceTemplateId", "Choose a template")
				return false
			}

			if(values.setupSource === "account" && !values.sourceAccountEmail) {
				form.setFieldError("sourceAccountEmail", "Choose an account")
				return false
			}

			return true
		}

		if(activeStep === 1) {
			const nameError = values.name.trim().length === 0 ? "Name is required" : null
			const contentError = values.content.trim().length === 0 ? "Content is required" : null
			form.setFieldError("name", nameError)
			form.setFieldError("content", contentError)
			return !nameError && !contentError
		}

		if(activeStep === 2) {
			if(!values.isDefault && !hasTargetSelection(values)) {
				form.setFieldError(
					"userEmails",
					"Choose at least one person, group, or OU, or set this as the default",
				)
				return false
			}

			return true
		}

		return true
	}

	function handleNext() {
		if(!validateCurrentStep()) return
		const nextStep = Math.min(activeStep + 1, LAST_WIZARD_STEP)
		setActiveStep(nextStep)
		setHighestStepVisited((highestStep) => Math.max(highestStep, nextStep))
	}

	function handleBack() {
		setActiveStep((currentStep) => Math.max(currentStep - 1, 0))
	}

	function handleStepClick(nextStep: number) {
		if(nextStep > highestStepVisited) return
		if(nextStep > activeStep && !validateCurrentStep()) return
		setActiveStep(nextStep)
	}

	function handleNameChange(name: string) {
		form.setFieldValue("name", name)
	}

	function handleContentChange(content: string) {
		form.setFieldValue("content", content)
	}

	function handleSave() {
		if(!validateCurrentStep()) return
		const prettyContent = formatHtmlWithDirectives(form.values.content)
		if(form.values.content !== prettyContent) {
			form.setFieldValue("content", prettyContent)
		}
		onSubmit({ ...form.values, content: prettyContent })
	}

	function shouldAllowSelectStep(step: number) {
		return highestStepVisited >= step && activeStep !== step
	}

	const nameError = typeof form.errors.name === "string" ? form.errors.name : undefined
	const contentError = typeof form.errors.content === "string" ? form.errors.content : undefined

	return (
		<Stack gap="xl">
			<Stepper
				active={ activeStep }
				onStepClick={ handleStepClick }
				allowNextStepsSelect={ false }
				orientation={ isNarrow ? "vertical" : "horizontal" }
				size="sm"
			>
				<Stepper.Step
					label="Setup"
					description="Starting point"
					icon={ <IconFilePlus size={ 18 } /> }
					allowStepSelect={ shouldAllowSelectStep(0) }
				>
					<SetupStep form={ form } templates={ templates } />
				</Stepper.Step>
				<Stepper.Step
					label="Design"
					description="Signature content"
					icon={ <IconPalette size={ 18 } /> }
					allowStepSelect={ shouldAllowSelectStep(1) }
				>
					<SignatureTemplateForm
						name={ form.values.name }
						nameError={ nameError }
						onNameChange={ handleNameChange }
						content={ form.values.content }
						contentError={ contentError }
						onContentChange={ handleContentChange }
					/>
				</Stepper.Step>
				<Stepper.Step
					label="Targets & Schedule"
					description="Who gets it"
					icon={ <IconUsers size={ 18 } /> }
					allowStepSelect={ shouldAllowSelectStep(2) }
				>
					<TargetsStep form={ form } />
				</Stepper.Step>
				<Stepper.Step
					label="Confirm"
					description="Review and save"
					icon={ <IconCircleCheck size={ 18 } /> }
					allowStepSelect={ shouldAllowSelectStep(3) }
				>
					<ConfirmStep values={ form.values } templates={ templates } />
				</Stepper.Step>
			</Stepper>

			<Group justify="space-between">
				<Button type="button" variant="light" onClick={ onCancel }>
					Cancel
				</Button>
				<Group>
					{ activeStep > 0 && (
						<Button type="button" variant="default" onClick={ handleBack }>
							Back
						</Button>
					) }
					{ activeStep < LAST_WIZARD_STEP
						? (
							<Button type="button" onClick={ handleNext }>
								Next
							</Button>
						)
						: (
							<Button type="button" onClick={ handleSave }>
								Save Template
							</Button>
						) }
				</Group>
			</Group>
		</Stack>
	)
}
