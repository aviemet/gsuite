import { type DirectoryClient, type DirectorySnapshot } from "./client"

export class RealDirectoryClient implements DirectoryClient {
	async listDirectory(): Promise<DirectorySnapshot> {
		throw new Error("Real Directory client is not configured yet")
	}
}
