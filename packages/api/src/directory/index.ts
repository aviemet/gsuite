import { type DirectoryClient } from "./client"
import { getSharedMockDirectoryClient } from "./mockClient"
import { RealDirectoryClient } from "./realClient"

export type DirectoryMode = "mock" | "real"

export function readDirectoryMode(
	env: NodeJS.ProcessEnv = process.env,
): DirectoryMode {
	const mode = env.DIRECTORY_MODE ?? env.GMAIL_MODE ?? "mock"
	return mode === "real" ? "real" : "mock"
}

export function createDirectoryClient(
	subjectEmail: string,
	mode = readDirectoryMode(),
): DirectoryClient {
	return mode === "real"
		? new RealDirectoryClient(subjectEmail)
		: getSharedMockDirectoryClient()
}
