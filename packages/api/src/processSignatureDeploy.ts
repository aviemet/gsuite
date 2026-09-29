import {
	type DirectoryUser,
	getTemplatePreviewContext,
	safeTemplateParse,
	SIGNATURE_DEPLOY_LOGS_COLLECTION,
	type SignatureDeployLog,
	type SignatureDeployResult,
	type SignatureUpdateMessage,
} from "@gsuite/shared"
import { type Firestore } from "firebase-admin/firestore"

import { type GmailClient } from "./gmail/client"
import { getPersonForEmail } from "./targets/people"

const DEFAULT_INTERVAL_MS = 200
const DEFAULT_MAX_ATTEMPTS = 3

export interface ProcessSignatureDeployDependencies {
	db: Firestore
	gmail: GmailClient
	loadUsers: () => Promise<readonly DirectoryUser[]>
	now?: () => Date
	sleep?: (milliseconds: number) => Promise<void>
	intervalMs?: number
	maxAttempts?: number
}

function delay(milliseconds: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, milliseconds)
	})
}

function configuredNumber(
	override: number | undefined,
	envValue: string | undefined,
	fallback: number,
): number {
	if(override !== undefined) return override
	if(!envValue) return fallback
	const parsed = Number(envValue)
	if(!Number.isInteger(parsed) || parsed < 0) return fallback
	return parsed
}

function errorMessage(error: unknown): string {
	if(error instanceof Error && error.message) return error.message
	return "Signature update failed"
}

export async function processSignatureDeploy(
	message: SignatureUpdateMessage,
	dependencies: ProcessSignatureDeployDependencies,
): Promise<SignatureDeployLog> {
	const templateSnap = await dependencies.db.collection("templates").doc(message.templateId).get()
	if(!templateSnap.exists) {
		throw new Error(`Template not found: ${message.templateId}`)
	}

	const content = String(templateSnap.data()?.content ?? "")
	const users = await dependencies.loadUsers()
	const usersByEmail = new Map(users.map((user) => [user.email, user]))
	const intervalMs = configuredNumber(
		dependencies.intervalMs,
		process.env.SIGNATURE_UPDATE_INTERVAL_MS,
		DEFAULT_INTERVAL_MS,
	)
	const maxAttempts = Math.max(1, configuredNumber(
		dependencies.maxAttempts,
		process.env.SIGNATURE_UPDATE_MAX_ATTEMPTS,
		DEFAULT_MAX_ATTEMPTS,
	))
	const now = dependencies.now ?? (() => new Date())
	const sleep = dependencies.sleep ?? delay
	const startedAt = now().toISOString()
	const results: SignatureDeployResult[] = []

	let isFirstUser = true
	for(const userEmail of message.userEmails) {
		if(!isFirstUser && intervalMs > 0) {
			await sleep(intervalMs)
		}
		isFirstUser = false

		const person = getPersonForEmail(userEmail, usersByEmail)
		const html = safeTemplateParse(content, getTemplatePreviewContext(person))

		for(let attempt = 1; attempt <= maxAttempts; attempt += 1) {
			try {
				await dependencies.gmail.updateSignature(userEmail, html)
				results.push({
					userEmail,
					status: "success",
					attempts: attempt,
					finishedAt: now().toISOString(),
				})
				break
			} catch (error) {
				if(attempt === maxAttempts) {
					results.push({
						userEmail,
						status: "error",
						attempts: attempt,
						error: errorMessage(error),
						finishedAt: now().toISOString(),
					})
					break
				}
				if(intervalMs > 0) {
					await sleep(intervalMs)
				}
			}
		}
	}

	const log: SignatureDeployLog = {
		deployId: message.deployId,
		templateId: message.templateId,
		startedAt,
		finishedAt: now().toISOString(),
		results,
	}

	await dependencies.db.collection(SIGNATURE_DEPLOY_LOGS_COLLECTION).doc(message.deployId).set(log)
	return log
}
