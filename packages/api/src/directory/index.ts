import { type DirectoryClient } from "./client"
import { getSharedMockDirectoryClient } from "./mockClient"
import { RealDirectoryClient } from "./realClient"

export function createDirectoryClient(
	mode = process.env.DIRECTORY_MODE ?? process.env.GMAIL_MODE ?? "mock",
): DirectoryClient {
	return mode === "real"
		? new RealDirectoryClient()
		: getSharedMockDirectoryClient()
}
