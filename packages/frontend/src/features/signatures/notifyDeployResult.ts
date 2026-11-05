import { notifications } from "@mantine/notifications"

export function notifyDeploySuccess(queuedUserCount: number) {
	if(queuedUserCount === 0) {
		notifications.show({
			color: "yellow",
			message: "No users currently resolve to this signature",
		})
		return
	}

	notifications.show({
		color: "green",
		message: queuedUserCount === 1
			? "Signature queued for deploy to 1 user"
			: `Signature queued for deploy to ${queuedUserCount} users`,
	})
}

export function notifyDeployError(error: unknown) {
	notifications.show({
		color: "red",
		message: error instanceof Error ? error.message : "Failed to deploy signature",
	})
}
