export { createDirectoryClient } from "./directory"
export { type DirectoryClient, type DirectorySnapshot } from "./directory/client"
export { getSharedMockDirectoryClient, MockDirectoryClient } from "./directory/mockClient"
export { RealDirectoryClient } from "./directory/realClient"
export { directoryHandler } from "./directoryHandler"
export { getAdminApp, getAdminAuth, getAdminFirestore, verifyIdToken } from "./firebase/admin"
export { createGmailClient } from "./gmail"
export { type GmailClient, type SignatureUpdate } from "./gmail/client"
export { getSharedMockGmailClient, MockGmailClient } from "./gmail/mockClient"
export { RealGmailClient } from "./gmail/realClient"
export { handleSignatureUpdate } from "./handleSignatureUpdate"
export {
	type ApiHandler,
	type ApiRequestContext,
	type ApiResult,
	createLocalApiServer,
	dispatchApiRequest,
	type DispatchRequest,
	type DispatchResult,
	fail,
	HttpError,
	type LocalRoute,
	type MemberApiHandler,
	type MemberApiRequestContext,
	ok,
	type SignedInApiHandler,
	type SignedInApiRequestContext,
	toErrorResult,
	withMemberAuth,
	withSignedInAuth,
} from "./http"
export { processSignatureDeploy } from "./processSignatureDeploy"
export { createCloudTasksPublisher, createInlineQueuePublisher, shouldEnqueueCloudTask } from "./queue/publisher"
export { type QueueEnvironment, type QueuePublisher } from "./queue/publisher"
export { apiRoutes } from "./routes"
export { saveAndDeploy } from "./saveAndDeploy"
export { saveAndDeployHandler } from "./saveAndDeployHandler"
export { getPersonForEmail } from "./targets/people"
